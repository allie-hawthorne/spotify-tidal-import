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
  isImporting: boolean,
  importError: string | null,

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
  importError: null,
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
  const [importError, setImportError] = useState<string | null>(null);

  const {importAlbums, ...restAlbums} = useImportAlbums();
  const {importArtists, ...restArtists} = useImportArtists();
  const {importTracks, ...restTracks} = useImportTracks();
  const {importPlaylists, ...restPlaylists} = useImportPlaylists();

  const onImportClick = async () => {
    if (isImporting) return;

    setIsImporting(true);
    setImportError(null);

    const tidal = new TidalImporter();
    const imports = [
      shouldImportAlbums && importAlbums(tidal),
      shouldImportArtists && importArtists(tidal),
      shouldImportTracks && importTracks(tidal),
      shouldImportPlaylists && importPlaylists(tidal),
    ].filter((p): p is Promise<void> => p !== false);

    const results = await Promise.allSettled(imports);
    const failures = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');

    failures.forEach(({reason}) => console.error('Import step failed:', reason));
    setImportError(failures.length
      ? `${failures.length} import ${failures.length === 1 ? 'step' : 'steps'} failed unexpectedly. Check the console for details.`
      : null);

    setIsImporting(false);
  }

  return <context.Provider value={{
    onImportClick,
    isImporting,
    importError,
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

