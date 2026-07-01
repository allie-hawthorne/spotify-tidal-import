import { TidalImporter } from "../../api-helpers/classes/TidalImporter";
import { useImportArtists } from "./useImportArtists";

export const symbolRegex = /[`~!@#$£€%^&*()_|+\-=?;:'",.<>{}[\]\\/]/gi;

export interface MinArtist {
  id: string,
  name: string,
}

// export const useEasyImport = (shouldImportTracks: boolean, shouldImportArtists: boolean, shouldImportAlbums: boolean, shouldImportPlaylists: boolean) => {
export const useEasyImport = (shouldImportArtists: boolean) => {
  const {importArtists, ...restArtists} = useImportArtists();
    
    const onImportClick = async () => {
      const tidal = new TidalImporter();
      if (shouldImportArtists) importArtists(tidal);
    }

    return {
      onImportClick,
      ...restArtists,
    };
}

