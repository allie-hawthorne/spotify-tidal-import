import { useState } from "react";
import { useSpotify } from "../../api-helpers/SpotifyContext";
import type { TidalImporter } from "../../api-helpers/classes/TidalImporter";
import { chunk } from "lodash";
import { matchTrack } from "./matching";
import type { MinTrack } from "./useImportTracks";

export interface MinPlaylist {
  id: string,
  playlistName: string,
}

const PLAYLISTS_CHUNK_SIZE = 2;
const MAX_TRACKS_PER_BATCH = 20; // Tidal API allows adding max 20 tracks at a time

export type PlaylistTracksMap = Record<MinPlaylist['id'], {playlist: MinPlaylist, tracks: MinTrack[]}>
const addToObject = (prev: PlaylistTracksMap, playlist: MinPlaylist, ...tracks: MinTrack[]) => ({...prev, [playlist.id]: {playlist, tracks: [...(prev[playlist.id].tracks ?? []), ...tracks]}})

export const useImportPlaylists = () => {
  const {playlistData: {items: playlists}} = useSpotify();

  // const [succeededPlaylistTracks, setSucceededTracks] = useState<[string, MinPlaylist, MinTrack][]>([]);
  const [succeededPlaylistTracks, setSucceededTracks] = useState<PlaylistTracksMap>({});
  const [erroredPlaylistTracks, setErroredTracks] = useState<PlaylistTracksMap>({});

  const importPlaylists = async (importer: TidalImporter) => {
    const playlistChunks = chunk(playlists, PLAYLISTS_CHUNK_SIZE);
    for (const [, playlistChunk] of playlistChunks.entries()) {

      // TODO: because we're awaiting each playlist chunk sequentially, if one playlist takes a long time to import, it will hold up the second slot.
      // We could sort playlists by track count so that longer ones are grouped together
      // or we could have a different approach to chunking overall maybe
      await Promise.all(playlistChunk.map(async (spotifyPlaylist) => {
        const {playlistName: spotifyPlaylistName, tracks} = spotifyPlaylist;
        const destPlaylistId = await importer.createPlaylist(spotifyPlaylistName);

        if (!destPlaylistId) return;

        const tidalTracksToAdd: MinTrack[] = [];
        for (const spotifyTrack of tracks) {
          const tidalTracks = await importer.searchForTrack(spotifyTrack.trackName, spotifyTrack.artists);

          if (!tidalTracks) {
            setErroredTracks(prev => addToObject(prev, spotifyPlaylist, spotifyTrack));
            console.log("No results on Tidal - Spotify:", spotifyTrack);
            continue;
          }

          const matchedTrack = matchTrack(spotifyTrack, tidalTracks);

          if (!matchedTrack) {
            console.log("No match on Tidal - Spotify:", spotifyTrack, "Tidal results:", tidalTracks);
            setErroredTracks(prev => addToObject(prev, spotifyPlaylist, spotifyTrack));
            continue;
          }

          console.log("TRACK MATCHED! Spotify:", spotifyTrack, "Tidal:", matchedTrack);
          tidalTracksToAdd.push(matchedTrack);
        }

        const batches = chunk(tidalTracksToAdd, MAX_TRACKS_PER_BATCH);
        for (const [batchIndex, batch] of batches.entries()) {
          const success = await importer.addToPlaylist(destPlaylistId, batch);
          if (success) {
            setSucceededTracks(prev => addToObject(prev, spotifyPlaylist, ...batch));
            console.log(`Added batch ${batchIndex + 1}/${batches.length} of tracks to destination playlist:`, spotifyPlaylistName, batch);
          } else {
            setErroredTracks(prev => addToObject(prev, spotifyPlaylist, ...batch));
            // setErroredPlaylists(prev => [...prev, {id: destPlaylistId, playlistName: spotifyPlaylistName}]);
            console.error(`Failed to add batch ${batchIndex + 1}/${batches.length} of tracks to destination playlist:`, spotifyPlaylistName, batch);
          }
        }

        // setSucceededPlaylists(prev => [...prev, {id: destPlaylistId, playlistName: spotifyPlaylistName}]);
      }));
    }
  };

  return {
    importPlaylists,
    succeededPlaylistTracks,
    erroredPlaylistTracks
  }
}
