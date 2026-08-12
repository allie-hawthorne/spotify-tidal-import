import chunk from "lodash/chunk";
import { useEffect, useState } from "react";
import { useSpotify } from "../../api-helpers/SpotifyContext";
import type { IAlbum } from "../../types";
import type { TidalImporter } from "../../api-helpers/classes/TidalImporter";
import { getCached, setCached } from "../../api-helpers/db";
import { MAX_TRACKS_PER_BATCH as MAX_ITEMS_PER_BATCH } from "./useImportTracks";
import { matchAlbum } from "./matching";

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

    const chunkedAlbums = chunk(albumsToImport, MAX_ITEMS_PER_BATCH);

    for (const chunk of chunkedAlbums) {
      const tidalAlbums = await importer.getAlbumsByBarcode(chunk.map(t => t.barcode));

      if (tidalAlbums.length !== chunk.length) {
        const tidalBarcodes = tidalAlbums.map(t => t.barcode);
        const missingAlbums = chunk.filter(t => !tidalBarcodes.includes(t.barcode));

        for (const album of missingAlbums) {
          const tidalAlbums = await importer.searchForAlbum(album.albumName, album.artists);

          if (!tidalAlbums) {
            return;
          }

          const matchedAlbum = matchAlbum(album, tidalAlbums);

          if (!matchedAlbum) {
            console.log('Missing album NOT matched:', matchedAlbum)
            setErroredAlbums(prev => [...prev, album]);
            continue;
          }
          
          console.log('Missing album matched:', matchedAlbum)
          // TODO: Add found albums to tidalAlbums in their original index to maintain order
          const res = await importer.addAlbum(matchedAlbum.id);

          if (!res) {
            setErroredAlbums(prev => [...prev, album]);
            continue;
          }
          setSucceededAlbums(prev => [...prev, matchedAlbum]);
        }
      }
      // TODO: Add found albums to tidalAlbums in their original index to maintain order
      const res = await importer.addAlbums(tidalAlbums);

      if (!res) {
        setErroredAlbums(prev => [...prev, ...tidalAlbums]);
        continue;
      }
      setSucceededAlbums(prev => [...prev, ...tidalAlbums]);
    }
  }

  const clearProgress = () => {
    setSucceededAlbums([]);
    setErroredAlbums([]);
  };

  return {
    importAlbums,
    succeededAlbums,
    erroredAlbums,
    clearProgress,
  }
}
