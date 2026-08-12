import { useEffect, useState } from "react";
import { useSpotify } from "../../api-helpers/SpotifyContext";
import type { TidalImporter } from "../../api-helpers/classes/TidalImporter";
import type { ITrack } from "../../types";
import { getCached, setCached } from "../../api-helpers/db";
import { findTracks } from "./findTracks";

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

    const onFail = (tracks: ITrack[]) => {
      setErroredTracks(prev => [...prev, ...tracks]);
    };

    const onMatch = async (tracks: ITrack[]) => {
      const ok = await importer.addTracks(tracks);

      if (ok) setSucceededTracks(prev => [...prev, ...tracks]);
      else setErroredTracks(prev => [...prev, ...tracks]);
    };
    
    await findTracks({importer, tracks: tracksToImport, onFail, onMatch});
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
