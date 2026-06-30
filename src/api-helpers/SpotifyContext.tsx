import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";
import type { Playlist } from "../types";
import type { Artist, SavedAlbum, SavedTrack } from "@spotify/web-api-ts-sdk";
import { getSpotifyPlaylists, getSpotifySavedAlbums, getSpotifySavedArtists, getSpotifySavedTracks } from "./spotify";

interface SpotifyContext {
  albums: SavedAlbum[]
  albumsLoading: boolean
  artists: Artist[]
  artistsLoading: boolean
  playlists: Playlist[]
  playlistsLoading: boolean
  tracks: SavedTrack[],
  tracksLoading: boolean,
}
const context = createContext<SpotifyContext>({
  albums: [],
  albumsLoading: false,
  artists: [],
  artistsLoading: false,
  playlists: [],
  playlistsLoading: false,
  tracks: [],
  tracksLoading: false,
})

export const SpotifyProvider = ({children}: PropsWithChildren) => {
  const [albums, setAlbums] = useState<SavedAlbum[]>([]);
  const [albumsLoading, setAlbumsLoading] = useState(true);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [artistsLoading, setArtistsLoading] = useState(true);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(true);
  const [tracks, setTracks] = useState<SavedTrack[]>([]);
  const [tracksLoading, setTracksLoading] = useState(true);

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
  
  useEffect(() => {
    getSpotifySavedTracks().then(t => {
      setTracks(t);
      setTracksLoading(false);
    })
  }, []);
  
  return <context.Provider value={{
    albums,
    albumsLoading,
    artists,
    artistsLoading,
    playlists,
    playlistsLoading,
    tracks,
    tracksLoading
  }}>
    {children}
  </context.Provider>
};

export const useSpotify = () => useContext(context);