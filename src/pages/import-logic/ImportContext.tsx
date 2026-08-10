import { createContext, useContext, useState, type Dispatch, type PropsWithChildren, type SetStateAction } from "react";
import { TidalImporter } from "../../api-helpers/classes/TidalImporter";
import type { IAlbum, IArtist, ITrack } from "../../types";
import { useImportPlaylists, type PlaylistTracksMap } from "./useImportPlaylists";
import { useImportAlbums } from "./useImportAlbums";
import { useImportArtists } from "./useImportArtists";
import { useImportTracks } from "./useImportTracks";

export type UseState<T> = Dispatch<SetStateAction<T>>

export interface EasyImportContextValue {
  onImportClick: () => Promise<void>,
  isImporting: boolean,
  clearImportProgress: () => void,

  succeededArtists: IArtist[],
  erroredArtists: IArtist[],
  shouldImportArtists: boolean
  setShouldImportArtists: UseState<boolean>

  succeededAlbums: IAlbum[],
  erroredAlbums: IAlbum[],
  shouldImportAlbums: boolean
  setShouldImportAlbums: UseState<boolean>

  succeededTracks: ITrack[],
  erroredTracks: ITrack[],
  shouldImportTracks: boolean
  setShouldImportTracks: UseState<boolean>

  succeededPlaylistTracks: PlaylistTracksMap,
  erroredPlaylistTracks: PlaylistTracksMap,
  shouldImportPlaylists: boolean
  setShouldImportPlaylists: UseState<boolean>
}

const context = createContext<EasyImportContextValue>({
  onImportClick: async () => {},
  isImporting: false,
  clearImportProgress: () => {},
  succeededArtists: [],
  erroredArtists: [],
  succeededAlbums: [],
  erroredAlbums: [],
  succeededTracks: [],
  erroredTracks: [],
  succeededPlaylistTracks: {},
  erroredPlaylistTracks: {},
  setShouldImportAlbums: () => {},
  setShouldImportArtists: () => {},
  setShouldImportPlaylists: () => {},
  setShouldImportTracks: () => {},
  shouldImportAlbums: false,
  shouldImportArtists: false,
  shouldImportPlaylists: false,
  shouldImportTracks: false,
});

export const ImporterProvider = ({children}: PropsWithChildren) => {
  const [shouldImportAlbums, setShouldImportAlbums] = useState(true);
  const [shouldImportArtists, setShouldImportArtists] = useState(true);
  const [shouldImportPlaylists, setShouldImportPlaylists] = useState(true);
  const [shouldImportTracks, setShouldImportTracks] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

  const {importAlbums, clearProgress: clearAlbumsProgress, ...restAlbums} = useImportAlbums();
  const {importArtists, clearProgress: clearArtistsProgress, ...restArtists} = useImportArtists();
  const {importTracks, clearProgress: clearTracksProgress, ...restTracks} = useImportTracks();
  const {importPlaylists, clearProgress: clearPlaylistsProgress, ...restPlaylists} = useImportPlaylists();

  const onImportClick = async () => {
    const tidal = new TidalImporter();
    setIsImporting(true);
    await Promise.all([
      shouldImportAlbums ? importAlbums(tidal) : undefined,
      shouldImportArtists ? importArtists(tidal) : undefined,
      shouldImportTracks ? importTracks(tidal) : undefined,
      shouldImportPlaylists ? importPlaylists(tidal) : undefined,
    ]);
    setIsImporting(false);
  }

  const clearImportProgress = () => {
    clearAlbumsProgress();
    clearArtistsProgress();
    clearTracksProgress();
    clearPlaylistsProgress();
  };

  return <context.Provider value={{
    onImportClick,
    isImporting,
    clearImportProgress,
    ...restTracks,
    ...restAlbums,
    ...restArtists,
    ...restPlaylists,
    shouldImportAlbums,
    setShouldImportAlbums,
    shouldImportArtists,
    setShouldImportArtists,
    shouldImportPlaylists,
    setShouldImportPlaylists,
    shouldImportTracks,
    setShouldImportTracks,
  }}>{children}</context.Provider>
}

export const useImporterContext = () => useContext(context);

