import { useEffect, useState } from "react";
import { useSpotify } from "../../api-helpers/SpotifyContext";
import type { IAlbum } from "../../types";
import type { TidalImporter } from "../../api-helpers/classes/TidalImporter";
import { matchAlbum } from "./matching";
import { getCached, setCached } from "../../api-helpers/db";

interface CachedProgress {
  succeeded: IAlbum[];
  errored: IAlbum[];
}

export const useImportAlbums = () => {
  const {albumData: {items: albums}, userId} = useSpotify();
  const cacheKey = userId ? `import:albums:${userId}` : null;

  const [succeededAlbums, setSucceededAlbums] = useState<IAlbum[]>([]);
  const [erroredAlbums, setErroredAlbums] = useState<IAlbum[]>([]);

  useEffect(() => {
    if (!cacheKey) return;
    getCached<CachedProgress>(cacheKey).then(cached => {
      if (!cached) return;
      setSucceededAlbums(cached.succeeded);
      setErroredAlbums(cached.errored);
    });
  }, [cacheKey]);

  useEffect(() => {
    if (!cacheKey) return;
    setCached(cacheKey, { succeeded: succeededAlbums, errored: erroredAlbums });
  }, [cacheKey, succeededAlbums, erroredAlbums]);

  const importAlbums = async (importer: TidalImporter) => {
    const alreadySucceededIds = new Set(succeededAlbums.map(a => a.id));
    const albumsToImport = albums.filter(a => !alreadySucceededIds.has(a.id));

    setErroredAlbums([]);

    for (const spotifyAlbum of albumsToImport) {
      const tidalAlbums = await importer.searchForAlbum(spotifyAlbum.albumName, spotifyAlbum.artists);

      if (!tidalAlbums) {
        console.log("No result on Tidal - Spotify:", spotifyAlbum);
        return;
      }

      const matchedAlbum = matchAlbum(spotifyAlbum, tidalAlbums);

      if (!matchedAlbum) {
        console.log("No match on Tidal - Spotify:", spotifyAlbum, "Tidal results:", tidalAlbums);
        setErroredAlbums(prev => [...prev, spotifyAlbum]);
        continue;
      }

      const res = await importer.addAlbum(matchedAlbum.id);

      if (!res) {
        console.log("Error adding album on Tidal - Spotify:", spotifyAlbum, "Tidal:", matchedAlbum.artists);
        setErroredAlbums(prev => [...prev, spotifyAlbum]);
        continue;
      }
      console.log("ALBUM MATCHED! Spotify:", spotifyAlbum, "Tidal:", matchedAlbum);
      setSucceededAlbums(prev => [...prev, matchedAlbum]);
    }
  }

  return {
    importAlbums,
    succeededAlbums,
    erroredAlbums
  }
}
