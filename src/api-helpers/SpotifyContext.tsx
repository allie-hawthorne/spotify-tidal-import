import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";
import type { PlaylistWithItems } from "../types";
import { getSpotifyPlaylists, getSpotifySavedAlbums, getSpotifySavedArtists } from "./spotify";
import type { MinTrack } from "../pages/EasyImport/useImportTracks";
import type { MinAlbum } from "../pages/EasyImport/useImportAlbums";
import type { MinArtist } from "../pages/EasyImport/useImport";

interface SpotifyContext {
  albums: MinAlbum[]
  albumsLoading: boolean
  albumTotal: number
  albumProgress: number

  artists: MinArtist[]
  artistsLoading: boolean
  artistTotal: number
  artistProgress: number

  playlists: PlaylistWithItems[]
  playlistsLoading: boolean
  playlistTotal: number
  playlistProgress: number

  tracks: MinTrack[]
  tracksLoading: boolean
  trackTotal: number
  trackProgress: number
}
const context = createContext<SpotifyContext>({
  albums: [],
  albumsLoading: false,
  albumTotal: 0,
  albumProgress: 0,

  artists: [],
  artistsLoading: false,
  artistTotal: 0,
  artistProgress: 0,

  playlists: [],
  playlistsLoading: false,
  playlistTotal: 0,
  playlistProgress: 0,
  
  tracks: [],
  tracksLoading: false,
  trackTotal: 0,
  trackProgress: 0,
})

export const SpotifyProvider = ({children}: PropsWithChildren) => {
  const [albums, setAlbums] = useState<MinAlbum[]>([]);
  const [albumsLoading, setAlbumsLoading] = useState(true);
  const [albumTotal, setAlbumTotal] = useState(0);
  const [albumProgress, setAlbumProgress] = useState(0);

  const [artists, setArtists] = useState<MinArtist[]>([]);
  const [artistsLoading, setArtistsLoading] = useState(true);
  const [artistTotal, setArtistTotal] = useState(0);
  const [artistProgress, setArtistProgress] = useState(0);

  const [playlists, setPlaylists] = useState<PlaylistWithItems[]>([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(true);
  const [playlistTotal, setPlaylistTotal] = useState(0);
  const [playlistProgress, setPlaylistProgress] = useState(0);
  
  const [tracks] = useState<MinTrack[]>([]);
  const [tracksLoading] = useState(true);
  const [trackTotal] = useState(0);
  const [trackProgress] = useState(0);

  useEffect(() => {
    getSpotifyPlaylists(setPlaylistTotal, setPlaylistProgress).then(p => {
      setPlaylists(p);
      setPlaylistsLoading(false);
    })
  }, []);

  useEffect(() => {
    getSpotifySavedArtists(setArtistTotal, setArtistProgress).then(a => {
      setArtists(a);
      setArtistsLoading(false);
    })
  }, []);

  useEffect(() => {
    getSpotifySavedAlbums(setAlbumTotal, setAlbumProgress).then(a => {
      setAlbums(a);
      setAlbumsLoading(false);
    })
  }, []);
  
  useEffect(() => {
    // getSpotifySavedTracks(setTrackTotal, setTrackProgress).then(t => {
    //   setTracks(t);
    //   setTracksLoading(false);
    // })
  }, []);
  
  return <context.Provider value={{
    albums,
    albumsLoading,
    albumTotal,
    albumProgress,

    artists,
    artistsLoading,
    artistTotal,
    artistProgress,

    playlists,
    playlistsLoading,
    playlistTotal,
    playlistProgress,

    tracks,
    tracksLoading,
    trackTotal,
    trackProgress
  }}>
    {children}
  </context.Provider>
};

export const useSpotify = () => useContext(context);