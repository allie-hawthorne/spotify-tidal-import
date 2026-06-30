import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";
import type { Playlist } from "../types";
import type { Artist, SavedAlbum } from "@spotify/web-api-ts-sdk";
import { getSpotifyPlaylists, getSpotifySavedAlbums, getSpotifySavedArtists } from "./spotify";

interface SpotifyContext {
  albums: SavedAlbum[]
  albumsLoading: boolean
  artists: Artist[]
  artistsLoading: boolean
  playlists: Playlist[]
  playlistsLoading: boolean
}
const context = createContext<SpotifyContext>({
  albums: [],
  albumsLoading: false,
  artists: [],
  artistsLoading: false,
  playlists: [],
  playlistsLoading: false,
})

export const SpotifyProvider = ({children}: PropsWithChildren) => {
  const [albums, setAlbums] = useState<SavedAlbum[]>([]);
  const [albumsLoading, setAlbumsLoading] = useState(true);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [artistsLoading, setArtistsLoading] = useState(true);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(true);

  useEffect(() => {
    getSpotifyPlaylists().then(p => {
      setPlaylists(p);
      setPlaylistsLoading(false);
    })
  }, []);

  useEffect(() => {
    getSpotifySavedArtists().then(a => {
      setArtists(a);
      setArtistsLoading(false);
    })
  }, []);

  useEffect(() => {
    getSpotifySavedAlbums().then(a => {
      setAlbums(a);
      setAlbumsLoading(false);
    })
  }, []);
  
  return <context.Provider value={{
    albums,
    albumsLoading,
    artists,
    artistsLoading,
    playlists,
    playlistsLoading
  }}>
    {children}
  </context.Provider>
};

export const useSpotify = () => useContext(context);