import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";
import type { Playlist } from "../types";
import type { Artist } from "@spotify/web-api-ts-sdk";
import { getSpotifyPlaylists, getSpotifySavedArtists } from "./spotify";

interface SpotifyContext {
  artists: Artist[]
  playlists: Playlist[]
  artistsLoading: boolean
  playlistsLoading: boolean
}
const context = createContext<SpotifyContext>({
  artists: [],
  artistsLoading: false,
  playlists: [],
  playlistsLoading: false,
})

export const SpotifyProvider = ({children}: PropsWithChildren) => {
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
  
  return <context.Provider value={{artists, artistsLoading, playlists, playlistsLoading}}>
    {children}
  </context.Provider>
};

export const useSpotify = () => useContext(context);