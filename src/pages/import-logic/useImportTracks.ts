import { useEffect, useState } from "react";
import chunk from "lodash/chunk";
import { useSpotify } from "../../api-helpers/SpotifyContext";
import type { TidalImporter } from "../../api-helpers/classes/TidalImporter";
import type { ITrack } from "../../types";
import { getCached, setCached } from "../../api-helpers/db";
import { matchTrack } from "./matching";

export const MAX_TRACKS_PER_BATCH = 20; // Tidal API allows adding max 20 tracks at a time (if adding by ISRC)

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

    const chunkedTracks = chunk(tracksToImport, MAX_TRACKS_PER_BATCH);
    
    for (const chunk of chunkedTracks) {
      const tidalTracks = await importer.getTracksByIsrc(chunk.map(t => t.isrc));

      if (tidalTracks.length !== chunk.length) {
        const tidalIsrcs = tidalTracks.map(t => t.isrc);
        const missingTracks = chunk.filter(t => !tidalIsrcs.includes(t.isrc));

        for (const track of missingTracks) {
          const tidalTracks = await importer.searchForTrack(track);

          if (!tidalTracks) {
            console.log("No results on Tidal - Spotify:", track);
            setErroredTracks(prev => [...prev, track]);
            return;
          }

          const matchedTrack = matchTrack(track, tidalTracks);

          if (!matchedTrack) {
            console.log("No match on Tidal - Spotify:", track, "Tidal results:", tidalTracks);
            setErroredTracks(prev => [...prev, track]);
            continue;
          }
          console.log('Missing track matched:', matchedTrack)
          // TODO: Add found tracks to tidalTracks in their original index to maintain order
          const res = await importer.addTrack(matchedTrack.id);
          
          if (res) setSucceededTracks(prev => [...prev, track]);
          else setErroredTracks(prev => [...prev, track]);
        };
      }

      const res = await importer.addTracks(tidalTracks);

      if (!res) {
        setErroredTracks(prev => [...prev, ...tidalTracks]);
        continue;
      }
      setSucceededTracks(prev => [...prev, ...tidalTracks]);
    }
  }

  const clearProgress = () => {
    setSucceededTracks([]);
    setErroredTracks([]);
  };

  return {
    importTracks,
    succeededTracks,
    erroredTracks,
    clearProgress,
  }
}
