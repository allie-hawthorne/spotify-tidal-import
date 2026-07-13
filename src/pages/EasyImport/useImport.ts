import { TidalImporter } from "../../api-helpers/classes/TidalImporter";
import { useImportAlbums } from "./useImportAlbums";
import { useImportArtists } from "./useImportArtists";
import { useImportPlaylists } from "./useImportPlaylists";
import { useImportTracks } from "./useImportTracks";

// TODO: Rename as also used for albums
export interface MinArtist {
  id: string,
  artistName: string,
}

// export const useEasyImport = (shouldImportTracks: boolean, shouldImportArtists: boolean, shouldImportAlbums: boolean, shouldImportPlaylists: boolean) => {
export const useEasyImport = (shouldImportTracks: boolean, shouldImportAlbums: boolean, shouldImportArtists: boolean, shouldImportPlaylists: boolean) => {
  const {importAlbums, ...restAlbums} = useImportAlbums();
  const {importArtists, ...restArtists} = useImportArtists();
  const {importTracks, ...restTracks} = useImportTracks();
  const {importPlaylists, ...restPlaylists} = useImportPlaylists();

    const onImportClick = async () => {
      const tidal = new TidalImporter();
      if (shouldImportAlbums) importAlbums(tidal);
      if (shouldImportArtists) importArtists(tidal);
      if (shouldImportTracks) importTracks(tidal);
      if (shouldImportPlaylists) importPlaylists(tidal)
    }

    return {
      onImportClick,
      ...restTracks,
      ...restAlbums,
      ...restArtists,
      ...restAlbums,
      ...restPlaylists
    };
}

