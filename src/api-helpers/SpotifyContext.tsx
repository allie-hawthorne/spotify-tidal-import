import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from "react";
import type { IAlbum, IArtist, IPlaylist, IPodcast, ITrack, SetNumberFn } from "../types";
import { SpotifyExporter } from "./classes/SpotifyImporter";
import { spotifyApi } from "./spotify";
import { getCached, setCached } from "./db";

type ValueOf<T extends object> = T[keyof T]
export type PlaylistStateValue = ValueOf<typeof PlaylistState>
export const PlaylistState = {
  Playlist: 'playlist',
  Tracks: 'tracks'
} as const;

function makeDummyResource<T>(): Resource<T> {
  return {items: [], loading: false, progress: 0, total: 0, fromCache: false}
}

const metaCacheKey = (userId: string) => `spotify:meta:${userId}`;

interface SpotifyContext {
  albumData: Resource<IAlbum>
  artistData: Resource<IArtist>
  trackData: Resource<ITrack>
  playlistData: Resource<IPlaylist>
  podcastData: Resource<IPodcast>

  userId: string | null
  totalPlaylistTracks: number

  isLoading: boolean
  haveTotalsReturned: boolean
  overallTotal: number
  overallProgress: number

  syncedAt: number | null
  refresh: () => void
}
const context = createContext<SpotifyContext>({
  userId: null,
  totalPlaylistTracks: 0,

  isLoading: false,
  haveTotalsReturned: false,
  overallTotal: 0,
  overallProgress: 0,

  syncedAt: null,
  refresh: () => {},

  albumData: makeDummyResource(),
  artistData: makeDummyResource(),
  playlistData: makeDummyResource(),
  trackData: makeDummyResource(),
  podcastData: makeDummyResource(),
})

export const SpotifyProvider = ({children}: PropsWithChildren) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [totalPlaylistTracks, setTotalPlaylistTracks] = useState(0);
  const [syncedAt, setSyncedAt] = useState<number | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const exporter = useRef(new SpotifyExporter());

  useEffect(() => {
    spotifyApi.currentUser.profile().then(p => setUserId(p.id)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!userId) return;
    getCached<number>(metaCacheKey(userId)).then(cached => {
      if (typeof cached === 'number') setSyncedAt(cached);
    });
  }, [userId]);

  // Counts fresh (non-cached) fetch completions for the current cycle, so "last synced" can be
  // stamped once all five resources have genuinely synced - reset on every explicit refresh.
  const freshFetchCountRef = useRef(0);

  const refresh = useCallback(() => {
    freshFetchCountRef.current = 0;
    setRefreshToken(t => t + 1);
  }, []);

  const handleFreshFetch = useCallback((syncedUserId: string) => {
    freshFetchCountRef.current += 1;
    if (freshFetchCountRef.current < 5) return;
    const now = Date.now();
    setSyncedAt(now);
    setCached(metaCacheKey(syncedUserId), now);
  }, []);

  const cacheKeyFor = useCallback((resource: string) => userId ? `spotify:${resource}:${userId}` : null, [userId]);

  const playlistFetcher = useCallback(
    (setTotal: SetNumberFn, setProgress: SetNumberFn) =>
      exporter.current.getPlaylists(setTotal, setProgress, setTotalPlaylistTracks),
    [exporter]
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

  const podcastFetcher = useCallback(
    (setTotal: SetNumberFn, setProgress: SetNumberFn) =>
      exporter.current.getSavedPodcasts(setTotal, setProgress),
    [exporter]
  );

  const onFreshFetch = useCallback(() => { if (userId) handleFreshFetch(userId); }, [userId, handleFreshFetch]);

  const playlistData = useGetItem<IPlaylist>(playlistFetcher, cacheKeyFor('playlists'), refreshToken, onFreshFetch);
  const artistData = useGetItem<IArtist>(artistFetcher, cacheKeyFor('artists'), refreshToken, onFreshFetch);
  const albumData = useGetItem<IAlbum>(albumFetcher, cacheKeyFor('albums'), refreshToken, onFreshFetch);
  const trackData = useGetItem<ITrack>(trackFetcher, cacheKeyFor('tracks'), refreshToken, onFreshFetch);
  const podcastData = useGetItem<IPodcast>(podcastFetcher, cacheKeyFor('podcasts'), refreshToken, onFreshFetch);

  const isLoading = trackData.loading || albumData.loading || artistData.loading || playlistData.loading || podcastData.loading;
  const overallTotal = trackData.total + albumData.total + artistData.total + playlistData.total + podcastData.total;
  const overallProgress = trackData.progress + albumData.progress + artistData.progress + playlistData.progress + podcastData.progress;
  const haveTotalsReturned = Boolean(
    (trackData.total || !trackData.loading) &&
    (albumData.total || !albumData.loading) &&
    (artistData.total || !artistData.loading) &&
    (playlistData.total || !playlistData.loading) &&
    (podcastData.total || !podcastData.loading)
  );

  return <context.Provider value={{
    albumData,
    artistData,
    playlistData,
    trackData,
    podcastData,
    userId,
    totalPlaylistTracks,

    isLoading,
    haveTotalsReturned,
    overallTotal,
    overallProgress,

    syncedAt,
    refresh,
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
  fromCache: boolean
}

function useGetItem<T>(
  fetcher: (setTotal: SetNumberFn, setProgress: SetNumberFn) => Promise<T[]>,
  cacheKey: string | null,
  refreshToken: number,
  onFreshFetch: () => void,
) {
  const [state, setState] = useState<Resource<T>>({
    items: [],
    loading: true,
    total: 0,
    progress: 0,
    fromCache: false,
  });

  useEffect(() => {
    if (!cacheKey) return;
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

    const run = async () => {
      // refreshToken === 0 means this is a normal load (not an explicit refresh) - try cache first
      if (refreshToken === 0) {
        const cached = await getCached<T[]>(cacheKey);
        if (cached && mounted) {
          setState({ items: cached, loading: false, total: cached.length, progress: cached.length, fromCache: true });
          return;
        }
      }

      if (mounted) setState({ items: [], loading: true, total: 0, progress: 0, fromCache: false });

      const items = await fetcher(setTotal, setProgress);
      if (!mounted) return;
      setState(s => ({ ...s, items, loading: false, fromCache: false }));
      await setCached(cacheKey, items);
      onFreshFetch();
    };

    run().catch(console.log);
    return () => { mounted = false; };
  }, [cacheKey, refreshToken, fetcher, onFreshFetch]);

  return state;
}
