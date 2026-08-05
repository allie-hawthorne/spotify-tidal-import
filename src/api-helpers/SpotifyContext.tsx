import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from "react";
import type { PlaylistWithItems, SetNumberFn } from "../types";
import { SpotifyExporter } from "./classes/SpotifyImporter";
import type { MinTrack } from "../pages/EasyImport/useImportTracks";
import type { MinAlbum } from "../pages/EasyImport/useImportAlbums";
import type { MinArtist } from "../pages/EasyImport/ImportContext";

type ValueOf<T extends object> = T[keyof T]
export type PlaylistStateValue = ValueOf<typeof PlaylistState>
export const PlaylistState = {
  Playlist: 'playlist',
  Tracks: 'tracks'
} as const;

function makeDummyResource<T>(): Resource<T> {
  return {items: [], loading: false, progress: 0, total: 0}
}

interface SpotifyContext {
  albumData: Resource<MinAlbum>
  artistData: Resource<MinArtist>
  trackData: Resource<MinTrack>
  playlistData: Resource<PlaylistWithItems>

  playlistState: PlaylistStateValue

  isLoading: boolean
  haveTotalsReturned: boolean
  overallTotal: number
  overallProgress: number
}
const context = createContext<SpotifyContext>({
  playlistState: PlaylistState.Playlist,

  isLoading: false,
  haveTotalsReturned: false,
  overallTotal: 0,
  overallProgress: 0,
  
  albumData: makeDummyResource(),
  artistData: makeDummyResource(),
  playlistData: makeDummyResource(),
  trackData: makeDummyResource(),
})

export const SpotifyProvider = ({children}: PropsWithChildren) => {
  const [playlistState, setPlaylistState] = useState<PlaylistStateValue>(PlaylistState.Playlist);
  const exporter = useRef(new SpotifyExporter());

  const playlistFetcher = useCallback(
    (setTotal: SetNumberFn, setProgress: SetNumberFn) =>
      exporter.current.getPlaylists(setTotal, setProgress, setPlaylistState),
    [exporter, setPlaylistState]
  );

  const artistFetcher = useCallback(
    (setTotal: SetNumberFn, setProgress: SetNumberFn) =>
      exporter.current.getSavedArtists(setTotal, setProgress),
    [exporter]
  );

  const albumFetcher = useCallback(
    (setTotal: SetNumberFn, setProgress: SetNumberFn) =>
      exporter.current.getSavedAlbums(setTotal, setProgress),
    [exporter]
  );

  const trackFetcher = useCallback(
    (setTotal: SetNumberFn, setProgress: SetNumberFn) =>
      exporter.current.getSavedTracks(setTotal, setProgress),
    [exporter]
  );

  const playlistData = useGetItem<PlaylistWithItems>(playlistFetcher);
  const artistData = useGetItem<MinArtist>(artistFetcher);
  const albumData = useGetItem<MinAlbum>(albumFetcher);
  const trackData = useGetItem<MinTrack>(trackFetcher);

  const isLoading = trackData.loading || albumData.loading || artistData.loading || playlistData.loading;
  const overallTotal = trackData.total + albumData.total + artistData.total + playlistData.total;
  const overallProgress = trackData.progress + albumData.progress + artistData.progress + playlistData.progress;
  const haveTotalsReturned = Boolean(
    (trackData.total || !trackData.loading) &&
    (albumData.total || !albumData.loading) &&
    (artistData.total || !artistData.loading) &&
    (playlistData.total || !playlistData.loading)
  );

  return <context.Provider value={{
    albumData,
    artistData,
    playlistData,
    trackData,
    playlistState,

    isLoading,
    haveTotalsReturned,
    overallTotal,
    overallProgress
  }}>
    {children}
  </context.Provider>
};

export const useSpotify = () => useContext(context);

export type Resource<T> = {
  items: T[]
  loading: boolean
  total: number
  progress: number
}

function useGetItem<T>(fetcher: (setTotal: SetNumberFn, setProgress: SetNumberFn) => Promise<T[]>) {
  const [state, setState] = useState<Resource<T>>({
    items: [],
    loading: true,
    total: 0,
    progress: 0,
  });

  useEffect(() => {
    let mounted = true;

    // I'm happy with this level of copy-paste vs legibility
    const setTotal: SetNumberFn = value => {
      if (!mounted) return;
      setState(s => ({
        ...s,
        total: typeof value === "function" ? value(s.total) : value,
      }));
    };

    const setProgress: SetNumberFn = value => {
      if (!mounted) return;
      
      setState(s => ({
        ...s,
        progress: typeof value === "function" ? value(s.progress) : value,
      }));
    };

    fetcher(setTotal, setProgress).then(items => {
      if (!mounted) return;
      setState(s => ({ ...s, items, loading: false }));
    }).catch(console.log);
    return () => { mounted = false; };
  }, [fetcher]);

  return state;
}