import { useEffect, useState } from "react";
import type { IArtist } from "../../types";
import { useSpotify } from "../../api-helpers/SpotifyContext";
import type { TidalImporter } from "../../api-helpers/classes/TidalImporter";
import { matchArtist } from "./matching";
import { getCached, setCached } from "../../api-helpers/db";

interface CachedProgress {
  succeeded: IArtist[];
  errored: IArtist[];
}

export const useImportArtists = () => {
  const {artistData: {items: artists}, userId} = useSpotify();
  const cacheKey = userId ? `import:artists:${userId}` : null;

  const [succeededArtists, setSucceededArtists] = useState<IArtist[]>([]);
  const [erroredArtists, setErroredArtists] = useState<IArtist[]>([]);

  useEffect(() => {
    if (!cacheKey) return;
    getCached<CachedProgress>(cacheKey).then(cached => {
      if (!cached) return;
      setSucceededArtists(cached.succeeded);
      setErroredArtists(cached.errored);
    });
  }, [cacheKey]);

  useEffect(() => {
    if (!cacheKey) return;
    setCached(cacheKey, { succeeded: succeededArtists, errored: erroredArtists });
  }, [cacheKey, succeededArtists, erroredArtists]);

  const importArtists = async (importer: TidalImporter) => {
    const alreadySucceededNames = new Set(succeededArtists.map(a => a.artistName));
    const artistsToImport = artists.filter(a => !alreadySucceededNames.has(a.artistName));

    setErroredArtists([]);

    for (const {artistName: spotifyName} of artistsToImport) {
      const tidalArtists = await importer.searchForArtist(spotifyName);

      if (!tidalArtists) {
        console.log("No result on Tidal - Spotify:", spotifyName);
        return;
      }

      const matchedArtist = matchArtist(spotifyName, tidalArtists);

      if (!matchedArtist) {
        console.log("No match on Tidal - Spotify:", spotifyName, "Tidal results:", tidalArtists);
        setErroredArtists(prev => [...prev, {id: '', artistName: spotifyName}]);
        continue;
      }

      const res = await importer.addArtist(matchedArtist.id);

      if (!res) {
        console.log("Error adding artist on Tidal - Spotify:", spotifyName, "Tidal:", matchedArtist.artistName);
        setErroredArtists(prev => [...prev, {id: matchedArtist.id, artistName: spotifyName}]);
        continue;
      }
      console.log(res);
      setSucceededArtists(prev => [...prev, {id: matchedArtist.id, artistName: matchedArtist.artistName}]);
    }
  }

  const clearProgress = () => {
    setSucceededArtists([]);
    setErroredArtists([]);
  };

  return {
    importArtists,
    succeededArtists,
    erroredArtists,
    clearProgress,
  }
}
