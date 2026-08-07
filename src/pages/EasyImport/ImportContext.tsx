import { createContext, useContext, useState, type Dispatch, type PropsWithChildren, type SetStateAction } from "react";
import { TidalImporter } from "../../api-helpers/classes/TidalImporter";
import { useImportAlbums } from "./useImportAlbums";
import { useImportArtists } from "./useImportArtists";
import { useImportPlaylists, type PlaylistTracksMap } from "./useImportPlaylists";
import { useImportTracks } from "./useImportTracks";
import type { IAlbum, IArtist, ITrack } from "../../types";

export type UseState<T> = Dispatch<SetStateAction<T>>

export interface EasyImportContextValue {
  onImportClick: () => Promise<void>,

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

  const {importAlbums, ...restAlbums} = useImportAlbums();
  const {importArtists, ...restArtists} = useImportArtists();
  const {importTracks, ...restTracks} = useImportTracks();
  const {importPlaylists, ...restPlaylists} = useImportPlaylists();

  const onImportClick = async () => {
    const tidal = new TidalImporter();
    if (shouldImportAlbums) importAlbums(tidal);
    if (shouldImportArtists) importArtists(tidal);
    if (shouldImportTracks) importTracks(tidal);
    if (shouldImportPlaylists) importPlaylists(tidal);
  }

  return <context.Provider value={{
    onImportClick,
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

