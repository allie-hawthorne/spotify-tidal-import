import { useState } from "react";
import { performRateLimitedRequest } from "../Playlists/useImportSpotify";
import { useSpotify } from "../../api-helpers/SpotifyContext";
import { type MinArtist } from "./useImport";
import type { TidalImporter } from "../../api-helpers/classes/TidalImporter";
import { matchAlbumNames } from "./matching";

export interface MinAlbum extends MinArtist {
  albumName: string
}

export const useImportAlbums = () => {
  const {albums} = useSpotify();

  const [succeededAlbums, setSucceededAlbums] = useState<MinAlbum[]>([]);
  const [erroredAlbums, setErroredAlbums] = useState<MinAlbum[]>([]);

  const importAlbums = async (importer: TidalImporter) => {
    for (const {album: {name: spotifyAlbumName, artists}} of albums) {
      const spotifyArtistName = artists.map(a => a.name).join(' ');
      const searchResults = await performRateLimitedRequest(() => importer.searchForAlbum(spotifyArtistName, spotifyAlbumName));

      const tidalAlbums = searchResults?.map((a): MinAlbum => ({
        id: a?.id ?? '',
        // @ts-expect-error - name does exist
        artistName: a?.artists?.map(artist => artist?.attributes?.name).join(' ') ?? '',
        // @ts-expect-error - name does exist
        albumName: a?.attributes?.title as string
      })) ?? [];

      if (!tidalAlbums) {
        console.log("No result on Tidal - Spotify:", spotifyAlbumName);
        return;
      }

      const matchedAlbum = matchAlbumNames(spotifyAlbumName, tidalAlbums);
      
      console.log("Spotify:", spotifyAlbumName, "-", spotifyArtistName, "Tidal:", matchedAlbum?.albumName, "-", matchedAlbum?.artistName);

      if (!matchedAlbum) {
        console.log("No match on Tidal - Spotify:", spotifyAlbumName, "Tidal results:", tidalAlbums);
        setErroredAlbums(prev => [...prev, {id: '', artistName: spotifyArtistName, albumName: spotifyAlbumName}]);
        continue;
      }
      
      const res = await performRateLimitedRequest(() => importer.addAlbum(matchedAlbum.id));

      if (!res) {
        console.log("Error adding album on Tidal - Spotify:", spotifyAlbumName, "Tidal:", matchedAlbum.artistName);
        setErroredAlbums(prev => [...prev, {id: matchedAlbum.id, artistName: matchedAlbum.artistName, albumName: matchedAlbum.albumName}]);
        continue;
      }
      console.log(res);
      setSucceededAlbums(prev => [...prev, {id: matchedAlbum.id, artistName: matchedAlbum.artistName, albumName: matchedAlbum.albumName}]);
    }
  }

  return {
    importAlbums,
    succeededAlbums,
    erroredAlbums
  }
}
