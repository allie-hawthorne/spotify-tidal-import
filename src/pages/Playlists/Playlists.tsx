import { useEffect, useState } from "react";
import { spotifyApi } from "../../api-helpers/spotify";
import type { Page, Playlist, TrackItem } from "@spotify/web-api-ts-sdk";


export const Home = () => {
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<Page<Playlist<TrackItem>>>();
  const fetchPlaylists = async () => {
    const playlists = await spotifyApi.playlists.getUsersPlaylists('1121194900');
    setSpotifyPlaylists(playlists);
  };
  useEffect(() => {
    fetchPlaylists();
  }, []);
  
  return <>
    <h1 className='text-center text-7xl'>Welcome!</h1>
    <div className='flex gap-2'>
      <div className="bg-violet-500/50 p-2 rounded">
        <h4 className="text-center text-2xl">Spotify playlists</h4>
        <div className="max-h-50 max-w-96 overflow-scroll">
          {spotifyPlaylists && (
            <ul>
              {spotifyPlaylists.items.map((playlist) => (
                <li key={playlist.id}>{playlist.name}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div>
        <h4 className="text-center text-2xl">Tidal playlists</h4>
      </div>
    </div>
  </>
}