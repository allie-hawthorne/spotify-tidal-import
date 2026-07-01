import { useState } from "react";
import { performRateLimitedRequest } from "../Playlists/useImportSpotify";
import { useSpotify } from "../../api-helpers/SpotifyContext";
import { symbolRegex, type MinArtist } from "./useImport";
import type { TidalImporter } from "../../api-helpers/classes/TidalImporter";

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
        setErroredAlbums(prev => [...prev, {id: '', artistName: spotifyAlbumName, albumName: spotifyAlbumName}]);
        continue;
      }
      
      setSucceededAlbums(prev => [...prev, {id: matchedAlbum.id, artistName: matchedAlbum.artistName, albumName: matchedAlbum.albumName}]);
    }
  }

  return {
    importAlbums,
    succeededAlbums,
    erroredAlbums
  }
}

// TODO: this is bad :') add artist name matching
export const matchAlbumNames = (spotifyName: string, tidalArtists: MinAlbum[]) => {
  for (const tidalArtist of tidalArtists) {
    const tidalName = tidalArtist.albumName;
    if (spotifyName === tidalName) return tidalArtist;
  }
  for (const tidalArtist of tidalArtists) {
    const tidalName = tidalArtist.albumName.toLocaleUpperCase();
    if (spotifyName.toLocaleUpperCase() === tidalName) return tidalArtist;
  }
    for (const tidalArtist of tidalArtists) {
    const tidalName = tidalArtist.albumName.toLocaleUpperCase().replace(symbolRegex, '');
    if (spotifyName.toLocaleUpperCase().replace(symbolRegex, '') === tidalName) return tidalArtist;
  }
}
