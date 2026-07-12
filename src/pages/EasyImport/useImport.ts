import { TidalImporter } from "../../api-helpers/classes/TidalImporter";
import { useImportAlbums } from "./useImportAlbums";
import { useImportArtists } from "./useImportArtists";
import { useImportTracks } from "./useImportTracks";

// TODO: Rename as also used for albums
export interface MinArtist {
  id: string,
  artistName: string,
}

export const useEasyImport = (shouldImportTracks: boolean, shouldImportAlbums: boolean, shouldImportArtists: boolean) => {
  const {importArtists, ...restArtists} = useImportArtists();
  const {importAlbums, ...restAlbums} = useImportAlbums();
  const {importTracks, ...restTracks} = useImportTracks();

    const onImportClick = async () => {
      const tidal = new TidalImporter();
      if (shouldImportAlbums) importAlbums(tidal);
      if (shouldImportArtists) importArtists(tidal);
      if (shouldImportTracks) importTracks(tidal);
    }

    return {
      onImportClick,
      ...restTracks,
      ...restAlbums,
      ...restArtists,
    };
}

