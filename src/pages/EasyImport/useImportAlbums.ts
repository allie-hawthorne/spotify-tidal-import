import { useState } from "react";
import { performRateLimitedRequest } from "../Playlists/useImportSpotify";
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
    for (const {album} of albums) {
      const {name: spotifyAlbumName, artists} = album;
      const spotifyArtistName = artists.map(a => a.name).join(' ');
      // TODO: Map this anywhere but here
      const spotifyAlbum: MinAlbum = {id: album.id, albumName: spotifyAlbumName, artistName: spotifyArtistName, barcode: album.external_ids.upc};
      const tidalAlbums = await performRateLimitedRequest(() => importer.searchForAlbum(spotifyArtistName, spotifyAlbumName));

      if (!tidalAlbums) {
        console.log("No result on Tidal - Spotify:", spotifyAlbumName);
        return;
      }

      const matchedAlbum = matchAlbum(spotifyAlbum, tidalAlbums);
      
      console.log("Spotify:", spotifyAlbumName, "-", spotifyArtistName, "Tidal:", matchedAlbum?.albumName, "-", matchedAlbum?.artistName);

      if (!matchedAlbum) {
        console.log("No match on Tidal - Spotify:", spotifyAlbumName, "Tidal results:", tidalAlbums);
        setErroredAlbums(prev => [...prev, spotifyAlbum]);
        continue;
      }
      
      const res = await performRateLimitedRequest(() => importer.addAlbum(matchedAlbum.id));

      if (!res) {
        console.log("Error adding album on Tidal - Spotify:", spotifyAlbumName, "Tidal:", matchedAlbum.artistName);
        setErroredAlbums(prev => [...prev, spotifyAlbum]);
        continue;
      }
      console.log(res);
      setSucceededAlbums(prev => [...prev, matchedAlbum]);
    }
  }

  return {
    importAlbums,
    succeededAlbums,
    erroredAlbums
  }
}
