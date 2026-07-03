import { useState } from "react";
import { performRateLimitedRequest } from "../Playlists/useImportSpotify";
import { symbolRegex, type MinArtist } from "./useImport";
import { useSpotify } from "../../api-helpers/SpotifyContext";
import type { TidalImporter } from "../../api-helpers/classes/TidalImporter";

export interface MinTrack extends MinArtist {
  trackName: string
}

export const useImportTracks = () => {
  const {tracks} = useSpotify();

  const [succeededTracks, setSucceededTracks] = useState<MinTrack[]>([]);
  const [erroredTracks, setErroredTracks] = useState<MinTrack[]>([]);

  const importTracks = async (importer: TidalImporter) => {
    for (const {track: {name: spotifyName, artists}} of tracks) {
      const spotifyArtistName = artists.map(a => a.name).join(' ');
      const searchResults = await performRateLimitedRequest(() => importer.searchForTrack(spotifyName, artists.map(a => a.name)));

      // @ts-expect-error - title does exist
      const tidalTracks = searchResults?.map((t): MinTrack => ({id: t?.id ?? '', artistName: "", trackName: t?.attributes?.title})) ?? [];

      if (!tidalTracks) {
        console.log("No result on Tidal - Spotify:", spotifyName);
        return;
      }

      const matchedTrack = matchTrackNames(spotifyName, tidalTracks);

      if (!matchedTrack) {
        console.log("No match on Tidal - Spotify:", spotifyName, "Tidal results:", tidalTracks);
        setErroredTracks(prev => [...prev, {id: '', artistName: spotifyArtistName, trackName: spotifyName}]);
        continue;
      }

      const res = await performRateLimitedRequest(() => importer.addTrack(matchedTrack.id));

      if (!res) {
        console.log("Error adding track on Tidal - Spotify:", spotifyName, "Tidal:", matchedTrack);
        setErroredTracks(prev => [...prev, {id: matchedTrack.id, artistName: spotifyArtistName, trackName: spotifyName}]);
        continue;
      }
      console.log("MATCHED! Spotify:", spotifyName, "Tidal:", matchedTrack);
      setSucceededTracks(prev => [...prev, {id: matchedTrack.id, artistName: matchedTrack.artistName, trackName: spotifyName}]);
    }
  }

  return {
    importTracks,
    succeededTracks,
    erroredTracks
  }
}

// TODO: can probably improve but the array length is like 10 max, and it early returns
// we're doing three loops because we want to prioritise matching names rather than array index
export const matchTrackNames = (spotifyName: string, tidalTracks: MinTrack[]) => {
  for (const tidalTrack of tidalTracks) {
    const tidalName = tidalTrack.trackName;
    if (spotifyName === tidalName) return tidalTrack;
  }
  for (const tidalTrack of tidalTracks) {
    const tidalName = tidalTrack.trackName.toLocaleUpperCase();
    if (spotifyName.toLocaleUpperCase() === tidalName) return tidalTrack;
  }
  for (const tidalTrack of tidalTracks) {
    const tidalName = tidalTrack.trackName.toLocaleUpperCase().replace(symbolRegex, '');
    if (spotifyName.toLocaleUpperCase().replace(symbolRegex, '') === tidalName) return tidalTrack;
  }
}
