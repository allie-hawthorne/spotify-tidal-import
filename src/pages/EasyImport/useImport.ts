import { TidalImporter } from "../../api-helpers/classes/TidalImporter";
import { useImportAlbums } from "./useImportAlbums";
import { useImportArtists } from "./useImportArtists";

export const symbolRegex = /[`~!@#$£€%^&*()_|+\-=?;:'",.<>{}[\]\\/]/gi;

// TODO: Rename as also used for albums
export interface MinArtist {
  id: string,
  artistName: string,
}

// export const useEasyImport = (shouldImportTracks: boolean, shouldImportArtists: boolean, shouldImportAlbums: boolean, shouldImportPlaylists: boolean) => {
export const useEasyImport = (shouldImportAlbums: boolean, shouldImportArtists: boolean) => {
  const {importArtists, ...restArtists} = useImportArtists();
  const {importAlbums, ...restAlbums} = useImportAlbums();
    
    const onImportClick = async () => {
      const tidal = new TidalImporter();
      if (shouldImportAlbums) importAlbums(tidal);
      if (shouldImportArtists) importArtists(tidal);
    }

    return {
      onImportClick,
      ...restArtists,
      ...restAlbums
    };
}

