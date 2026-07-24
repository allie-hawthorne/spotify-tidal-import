import { useState } from "react";
import { type MinArtist } from "./ImportContext";
import { useSpotify } from "../../api-helpers/SpotifyContext";
import type { TidalImporter } from "../../api-helpers/classes/TidalImporter";
import { matchTrack } from "./matching";

export interface MinTrack extends MinArtist {
  trackName: string
  isrc: string
}

export const useImportTracks = () => {
  const {tracks} = useSpotify();

  const [succeededTracks, setSucceededTracks] = useState<MinTrack[]>([]);
  const [erroredTracks, setErroredTracks] = useState<MinTrack[]>([]);

  const importTracks = async (importer: TidalImporter) => {
    for (const spotifyTrack of tracks) {

      const tidalTracks = await importer.searchForTrack(spotifyTrack.trackName, [spotifyTrack.artistName]);

      if (!tidalTracks) {
        console.log("No results on Tidal - Spotify:", spotifyTrack);
        setErroredTracks(prev => [...prev, spotifyTrack]);
        return;
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
