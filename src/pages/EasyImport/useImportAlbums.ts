import { useState } from "react";
import { useSpotify } from "../../api-helpers/SpotifyContext";
import type { IAlbum } from "../../types";
import type { TidalImporter } from "../../api-helpers/classes/TidalImporter";
import { matchAlbum } from "./matching";

export const useImportAlbums = () => {
  const {albumData: {items: albums}} = useSpotify();

  const [succeededAlbums, setSucceededAlbums] = useState<IAlbum[]>([]);
  const [erroredAlbums, setErroredAlbums] = useState<IAlbum[]>([]);

  const importAlbums = async (importer: TidalImporter) => {
    for (const spotifyAlbum of albums) {
      const tidalAlbums = await importer.searchForAlbum(spotifyAlbum.albumName, spotifyAlbum.artists);

      if (!tidalAlbums) {
        console.log("No result on Tidal - Spotify:", spotifyAlbum);
        setErroredAlbums(prev => [...prev, spotifyAlbum]);
        continue;
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
