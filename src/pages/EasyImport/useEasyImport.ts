import { useState } from "react";
import { TidalImporter } from "../../api-helpers/classes/TidalImporter";
import { performRateLimitedRequest } from "../Playlists/useImportSpotify";
import { useSpotify } from "../../api-helpers/SpotifyContext";

const symbolRegex = /[`~!@#$£€%^&*()_|+\-=?;:'",.<>{}[\]\\/]/gi;

export interface MinArtist {
  id: string,
  name: string,
}

// export const useEasyImport = (shouldImportTracks: boolean, shouldImportArtists: boolean, shouldImportAlbums: boolean, shouldImportPlaylists: boolean) => {
export const useEasyImport = (shouldImportArtists: boolean) => {
    const {artists} = useSpotify();
  
    const [succeededArtists, setSucceededArtists] = useState<MinArtist[]>([]);
    const [erroredArtists, setErroredArtists] = useState<MinArtist[]>([{id: '', name: 'test'}]);

    const importArtists = async (importer: TidalImporter) => {
      for (const {name: spotifyName} of artists) {
        const searchResults = await performRateLimitedRequest(() => importer.searchForArtist(spotifyName));
  
        // @ts-expect-error - name does exist
        const tidalArtists = searchResults?.map((a): MinArtist => ({id: a?.id ?? '', name: a.attributes?.name as string})) ?? [];
  
        if (!tidalArtists) {
          console.log("No result on Tidal - Spotify:", spotifyName);
          return;
        }
  
        const matchedArtist = matchArtistNames(spotifyName, tidalArtists);
  
        if (!matchedArtist) {
          console.log("No match on Tidal - Spotify:", spotifyName, "Tidal results:", tidalArtists);
          setErroredArtists(prev => [...prev, {id: '', name: spotifyName}]);
          continue;
        }
  
        const res = await performRateLimitedRequest(() => importer.addArtist(matchedArtist.id));
  
        if (!res) {
          console.log("Error adding artist on Tidal - Spotify:", spotifyName, "Tidal:", matchedArtist.name);
          setErroredArtists(prev => [...prev, {id: matchedArtist.id, name: spotifyName}]);
          continue;
        }
        console.log(res);
        setSucceededArtists(prev => [...prev, {id: matchedArtist.id, name: matchedArtist.name}]);
      }
    }
    
    const onImportClick = async () => {
      const tidal = new TidalImporter();
      if (shouldImportArtists) importArtists(tidal);
    }

    return {
      onImportClick,
      succeededArtists,
      erroredArtists,
    };
}

// TODO: can probably improve but the array length is like 10 max, and it early returns
// we're doing three loops because we want to prioritise matching names rather than array index
const matchArtistNames = (spotifyName: string, tidalArtists: {id: string, name: string}[]) => {
  for (const tidalArtist of tidalArtists) {
    const tidalName = tidalArtist.name;
    if (spotifyName === tidalName) return tidalArtist;
  }
  for (const tidalArtist of tidalArtists) {
    const tidalName = tidalArtist.name.toLocaleUpperCase();
    if (spotifyName.toLocaleUpperCase() === tidalName) return tidalArtist;
  }
    for (const tidalArtist of tidalArtists) {
    const tidalName = tidalArtist.name.toLocaleUpperCase().replace(symbolRegex, '');
    if (spotifyName.toLocaleUpperCase().replace(symbolRegex, '') === tidalName) return tidalArtist;
  }
}
