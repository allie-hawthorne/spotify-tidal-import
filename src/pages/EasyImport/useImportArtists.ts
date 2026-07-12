import { useState } from "react";
import { performRateLimitedRequest } from "../Playlists/useImportSpotify";
import { type MinArtist } from "./useImport";
import { useSpotify } from "../../api-helpers/SpotifyContext";
import type { TidalImporter } from "../../api-helpers/classes/TidalImporter";
import { matchArtistNames } from "./matching";

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
