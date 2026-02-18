import { useEffect, useState } from "react";
import { spotifyApi } from "../../api-helpers/spotify";
import type { Page, Playlist, TrackItem } from "@spotify/web-api-ts-sdk";
import { PlaylistContainer } from "./PlaylistContainer";
import { Service } from "../../components/LoginButton";


export const Home = () => {
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<Page<Playlist<TrackItem>>>();

  useEffect(() => {
    spotifyApi.playlists.getUsersPlaylists('1121194900').then(setSpotifyPlaylists).catch(console.error);
  }, []);
  
  return <>
    <h1 className='text-center text-7xl'>Welcome!</h1>
    <div className='flex gap-2'>
      <PlaylistContainer playlists={spotifyPlaylists?.items} provider={Service.Spotify} />
      <PlaylistContainer provider={Service.Tidal} />
    </div>
  </>
}