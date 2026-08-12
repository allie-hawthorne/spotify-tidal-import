import chunk from "lodash/chunk";
import { useEffect, useState } from "react";
import { useSpotify } from "../../api-helpers/SpotifyContext";
import type { TidalImporter } from "../../api-helpers/classes/TidalImporter";
import type { ITrack } from "../../types";
import { getCached, setCached } from "../../api-helpers/db";
import { MAX_ITEMS_PER_BATCH } from "../../api-helpers/tidal";
import { findTracks } from "./findTracks";

// Not to be confused with the IPlaylist interface in types.ts
interface MinPlaylist {
  id: string,
  playlistName: string,
}
export type PlaylistTracksMap = Record<MinPlaylist['id'], {playlist: MinPlaylist, tracks: ITrack[]}>

interface CachedProgress {
  succeeded: PlaylistTracksMap;
  errored: PlaylistTracksMap;
  // Spotify playlist id -> id of the Tidal playlist already created for it, so a resumed
  // import adds to the same destination playlist instead of creating a duplicate.
  destPlaylistIds: Record<string, string>;
}

const PLAYLISTS_CHUNK_SIZE = 2;

const addToObject = (prev: PlaylistTracksMap, playlist: MinPlaylist, ...tracks: ITrack[]) => ({...prev, [playlist.id]: {playlist, tracks: [...(prev[playlist.id]?.tracks ?? []), ...tracks]}})

export const useImportPlaylists = () => {
  const {playlistData: {items: playlists}, userId} = useSpotify();
  const cacheKey = userId ? `import:playlists:${userId}` : null;

  const [succeededPlaylistTracks, setSucceededTracks] = useState<PlaylistTracksMap>({});
  const [erroredPlaylistTracks, setErroredTracks] = useState<PlaylistTracksMap>({});
  const [destPlaylistIds, setDestPlaylistIds] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!cacheKey) return;
    getCached<CachedProgress>(cacheKey).then(cached => {
      if (!cached) return;
      setSucceededTracks(cached.succeeded);
      setErroredTracks(cached.errored);
      setDestPlaylistIds(cached.destPlaylistIds);
    });
  }, [cacheKey]);

  useEffect(() => {
    if (!cacheKey) return;
    setCached(cacheKey, { succeeded: succeededPlaylistTracks, errored: erroredPlaylistTracks, destPlaylistIds });
  }, [cacheKey, succeededPlaylistTracks, erroredPlaylistTracks, destPlaylistIds]);

  const importPlaylists = async (importer: TidalImporter) => {
    // About to reattempt everything not yet succeeded, so clear stale errors from a
    // previous run rather than accumulating duplicate entries across import attempts.
    setErroredTracks({});

    const playlistChunks = chunk(playlists, PLAYLISTS_CHUNK_SIZE);
    for (const [, playlistChunk] of playlistChunks.entries()) {

      // TODO: because we're awaiting each playlist chunk sequentially, if one playlist takes a long time to import, it will hold up the second slot.
      // We could sort playlists by track count so that longer ones are grouped together
      // or we could have a different approach to chunking overall maybe
      await Promise.all(playlistChunk.map(async (spotifyPlaylist) => {
        const {playlistName: spotifyPlaylistName, tracks: spotifyTracks} = spotifyPlaylist;

        const alreadySucceededIds = new Set(succeededPlaylistTracks[spotifyPlaylist.id]?.tracks.map(t => t.id) ?? []);
        const tracksToImport = spotifyTracks.filter(t => !alreadySucceededIds.has(t.id));

        if (!tracksToImport.length) return;

        let destPlaylistId = destPlaylistIds[spotifyPlaylist.id];
        if (!destPlaylistId) {
          const created = await importer.createPlaylist(spotifyPlaylistName);
          if (!created) return;
          destPlaylistId = created;
          setDestPlaylistIds(prev => ({...prev, [spotifyPlaylist.id]: created}));
        }

        const onFail = (tracks: ITrack[]) => {
          setErroredTracks(prev => addToObject(prev, spotifyPlaylist, ...tracks));
        }

        const onMatch = async (tracks: ITrack[]) => {
          const batches = chunk(tracks, MAX_ITEMS_PER_BATCH);
          for (const [batchIndex, batch] of batches.entries()) {
            const ok = await importer.addToPlaylist(destPlaylistId, batch);

            if (ok) {
              setSucceededTracks(prev => addToObject(prev, spotifyPlaylist, ...batch));
              console.log(`Added batch ${batchIndex + 1}/${batches.length} of tracks to destination playlist:`, spotifyPlaylistName, batch);
            } else {
              setErroredTracks(prev => addToObject(prev, spotifyPlaylist, ...batch));
              console.error(`Failed to add batch ${batchIndex + 1}/${batches.length} of tracks to destination playlist:`, spotifyPlaylistName, batch);
            }
          }
        }
        
        await findTracks({importer, tracks: tracksToImport, onFail, onMatch});
      }));
    }
  };

  const clearProgress = () => {
    setSucceededTracks({});
    setErroredTracks({});
    setDestPlaylistIds({});
  };

  return {
    importPlaylists,
    succeededPlaylistTracks,
    erroredPlaylistTracks,
    clearProgress,
  }
}
