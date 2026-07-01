import { useState } from "react";
import { performRateLimitedRequest } from "../Playlists/useImportSpotify";
import { symbolRegex, type MinArtist } from "./useImport";
import { useSpotify } from "../../api-helpers/SpotifyContext";
import type { TidalImporter } from "../../api-helpers/classes/TidalImporter";

export const useImportArtists = () => {
  const {artists} = useSpotify();

  const [succeededArtists, setSucceededArtists] = useState<MinArtist[]>([]);
  const [erroredArtists, setErroredArtists] = useState<MinArtist[]>([]);

  const importArtists = async (importer: TidalImporter) => {
    for (const {name: spotifyName} of artists) {
      const searchResults = await performRateLimitedRequest(() => importer.searchForArtist(spotifyName));

      // @ts-expect-error - name does exist
      const tidalArtists = searchResults?.map((a): MinArtist => ({id: a?.id ?? '', artistName: a?.attributes?.name as string})) ?? [];

      if (!tidalArtists) {
        console.log("No result on Tidal - Spotify:", spotifyName);
        return;
      }

      const matchedArtist = matchArtistNames(spotifyName, tidalArtists);

      if (!matchedArtist) {
        console.log("No match on Tidal - Spotify:", spotifyName, "Tidal results:", tidalArtists);
        setErroredArtists(prev => [...prev, {id: '', artistName: spotifyName}]);
        continue;
      }

      const res = await performRateLimitedRequest(() => importer.addArtist(matchedArtist.id));

      if (!res) {
        console.log("Error adding artist on Tidal - Spotify:", spotifyName, "Tidal:", matchedArtist.artistName);
        setErroredArtists(prev => [...prev, {id: matchedArtist.id, artistName: spotifyName}]);
        continue;
      }
      console.log(res);
      setSucceededArtists(prev => [...prev, {id: matchedArtist.id, artistName: matchedArtist.artistName}]);
    }
  }

  return {
    importArtists,
    succeededArtists,
    erroredArtists
  }
}

// TODO: can probably improve but the array length is like 10 max, and it early returns
// we're doing three loops because we want to prioritise matching names rather than array index
export const matchArtistNames = (spotifyName: string, tidalArtists: MinArtist[]) => {
  for (const tidalArtist of tidalArtists) {
    const tidalName = tidalArtist.artistName;
    if (spotifyName === tidalName) return tidalArtist;
  }
  for (const tidalArtist of tidalArtists) {
    const tidalName = tidalArtist.artistName.toLocaleUpperCase();
    if (spotifyName.toLocaleUpperCase() === tidalName) return tidalArtist;
  }
  for (const tidalArtist of tidalArtists) {
    const tidalName = tidalArtist.artistName.toLocaleUpperCase().replace(symbolRegex, '');
    if (spotifyName.toLocaleUpperCase().replace(symbolRegex, '') === tidalName) return tidalArtist;
  }
}
