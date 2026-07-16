import { useState } from "react";
import { performRateLimitedRequest } from "../../utils";
import { useSpotify } from "../../api-helpers/SpotifyContext";
import { type MinArtist } from "./useImport";
import type { TidalImporter } from "../../api-helpers/classes/TidalImporter";
import { matchAlbum } from "./matching";

export interface MinAlbum extends MinArtist {
  albumName: string
  barcode: string
}

export const useImportAlbums = () => {
  const {albums} = useSpotify();

  const [succeededAlbums, setSucceededAlbums] = useState<MinAlbum[]>([]);
  const [erroredAlbums, setErroredAlbums] = useState<MinAlbum[]>([]);

  const importAlbums = async (importer: TidalImporter) => {
    for (const spotifyAlbum of albums) {
      const tidalAlbums = await performRateLimitedRequest(() => importer.searchForAlbum(spotifyAlbum.artistName, spotifyAlbum.albumName));

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
      
      const res = await performRateLimitedRequest(() => importer.addAlbum(matchedAlbum.id));

      if (!res) {
        console.log("Error adding album on Tidal - Spotify:", spotifyAlbum, "Tidal:", matchedAlbum.artistName);
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
