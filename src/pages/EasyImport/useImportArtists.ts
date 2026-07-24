import { useState } from "react";
import { type MinArtist } from "./ImportContext";
import { useSpotify } from "../../api-helpers/SpotifyContext";
import type { TidalImporter } from "../../api-helpers/classes/TidalImporter";
import { matchArtist } from "./matching";

export const useImportArtists = () => {
  const {artists} = useSpotify();

  const [succeededArtists, setSucceededArtists] = useState<MinArtist[]>([]);
  const [erroredArtists, setErroredArtists] = useState<MinArtist[]>([]);

  const importArtists = async (importer: TidalImporter) => {
    for (const {artistName: spotifyName} of artists) {
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

  return {
    importArtists,
    succeededArtists,
    erroredArtists
  }
}
