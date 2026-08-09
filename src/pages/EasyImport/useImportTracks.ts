import { useEffect, useState } from "react";
import { useSpotify } from "../../api-helpers/SpotifyContext";
import type { TidalImporter } from "../../api-helpers/classes/TidalImporter";
import { matchTrack } from "./matching";
import type { ITrack } from "../../types";
import { getCached, setCached } from "../../api-helpers/db";

interface CachedProgress {
  succeeded: ITrack[];
  errored: ITrack[];
}

export const useImportTracks = () => {
  const {trackData: {items: tracks}, userId} = useSpotify();
  const cacheKey = userId ? `import:tracks:${userId}` : null;

  const [succeededTracks, setSucceededTracks] = useState<ITrack[]>([]);
  const [erroredTracks, setErroredTracks] = useState<ITrack[]>([]);

  useEffect(() => {
    if (!cacheKey) return;
    getCached<CachedProgress>(cacheKey).then(cached => {
      if (!cached) return;
      setSucceededTracks(cached.succeeded);
      setErroredTracks(cached.errored);
    });
  }, [cacheKey]);

  useEffect(() => {
    if (!cacheKey) return;
    setCached(cacheKey, { succeeded: succeededTracks, errored: erroredTracks });
  }, [cacheKey, succeededTracks, erroredTracks]);

  const importTracks = async (importer: TidalImporter) => {
    const alreadySucceededIds = new Set(succeededTracks.map(t => t.id));
    const tracksToImport = tracks.filter(t => !alreadySucceededIds.has(t.id));

    // About to reattempt everything not yet succeeded, so clear stale errors from a
    // previous run rather than accumulating duplicate entries across import attempts.
    setErroredTracks([]);

    for (const spotifyTrack of tracksToImport) {

      const tidalTracks = await importer.searchForTrack(spotifyTrack.trackName, spotifyTrack.artists);

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
