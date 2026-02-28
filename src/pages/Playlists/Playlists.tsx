import { useEffect, useState } from "react";
import { spotifyApi } from "../../api-helpers/spotify";
import { tidalApi } from "../../api-helpers/tidal";
import { PlaylistContainer } from "./PlaylistContainer";
import { Service } from "../../components/LoginButton";
import { ImportButton } from "../../components/ImportButton";

export interface Playlist {
  name: string;
  id: string;
}

export const Home = () => {
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<Playlist[]>([]);
  const [tidalPlaylists, setTidalPlaylists] = useState<Playlist[]>([]);

  const [selectedSpotifyPlaylists, setSelectedSpotifyPlaylists] = useState<Playlist[]>([]);
  const [selectedTidalPlaylists, setSelectedTidalPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    // TODO: get user id from spotify api instead of hardcoding it
    spotifyApi.playlists.getUsersPlaylists('1121194900')
      .then(d => setSpotifyPlaylists(d.items.map(({id, name}) => ({id, name}))))
      .catch(console.error);
  }, []);

  useEffect(() => {
    // TODO: get user id from tidal api instead of hardcoding it
    // TODO: could probably do with tidying this up for readability
    tidalApi.GET('/playlists', {params: {query: {"filter[owners.id]": ["207473666"]}}})
      .then(d => setTidalPlaylists(d.data?.data.map(({id, attributes}) => ({
        id,
        name: attributes?.name ?? '',
      })) ?? []))
      .catch(console.error);
  }, []);
  
  return <div className="flex flex-col gap-5 items-center">
    <h1 className='text-center text-6xl'>Welcome!</h1>
    <div className='flex gap-2'>
      <PlaylistContainer
        playlists={spotifyPlaylists}
        provider={Service.Spotify}
        selectedPlaylists={selectedSpotifyPlaylists}
        setSelectedPlaylists={setSelectedSpotifyPlaylists}
      />
      <PlaylistContainer
        playlists={tidalPlaylists}
        provider={Service.Tidal}
        selectedPlaylists={selectedTidalPlaylists}
        setSelectedPlaylists={setSelectedTidalPlaylists}
      />
    </div>
    <ImportButton onClick={() => {
      console.log('Selected Spotify playlists:', selectedSpotifyPlaylists);
      console.log('Selected Tidal playlists:', selectedTidalPlaylists);
    }}/>
  </div>;
}