import { useState } from "react";
import { useSpotify } from "../../api-helpers/SpotifyContext";
import type { TidalImporter } from "../../api-helpers/classes/TidalImporter";
import { matchTrack } from "./matching";
import type { ITrack } from "../../types";

export const useImportTracks = () => {
  const {trackData: {items: tracks}} = useSpotify();

  const [succeededTracks, setSucceededTracks] = useState<ITrack[]>([]);
  const [erroredTracks, setErroredTracks] = useState<ITrack[]>([]);

  const importTracks = async (importer: TidalImporter) => {
    for (const spotifyTrack of tracks) {

      const tidalTracks = await importer.searchForTrack(spotifyTrack.trackName, spotifyTrack.artists);

      if (!tidalTracks) {
        console.log("No results on Tidal - Spotify:", spotifyTrack);
        setErroredTracks(prev => [...prev, spotifyTrack]);
        continue;
      }

      const matchedTrack = matchTrack(spotifyTrack, tidalTracks);

      if (!matchedTrack) {
        console.log("No match on Tidal - Spotify:", spotifyTrack, "Tidal results:", tidalTracks);
        setErroredTracks(prev => [...prev, spotifyTrack]);
        continue;
      }

      const res = await importer.addTrack(matchedTrack.id);

      if (!res) {
        console.log("Error adding track on Tidal - Spotify:", spotifyTrack, "Tidal:", matchedTrack);
        setErroredTracks(prev => [...prev, matchedTrack]);
        continue;
      }
      console.log("TRACK MATCHED! Spotify:", spotifyTrack, "Tidal:", matchedTrack);
      setSucceededTracks(prev => [...prev, matchedTrack]);
    }
  }

  return {
    importTracks,
    succeededTracks,
    erroredTracks
  }
}
