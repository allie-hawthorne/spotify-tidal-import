import { useEffect, useState } from "react";
import { getSpotifyPlaylists } from "../../api-helpers/spotify";
import { getTidalPlaylists } from "../../api-helpers/tidal";
import { PlaylistContainer } from "./PlaylistContainer";
import { Service } from "../../components/LoginButton";
import { ImportButton } from "../../components/ImportButton";
import { useImportSpotify } from "./useImportSpotify";

export interface Playlist {
  id: string;
  name: string;
  description: string;
  trackCount: number;
}

export const Home = () => {
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<Playlist[]>([]);
  const [tidalPlaylists, setTidalPlaylists] = useState<Playlist[]>([]);

  const [selectedPlaylists, setSelectedPlaylists] = useState<Playlist[]>([]);
  const [importSource, setImportSource] = useState<Service>();

  const { onImportClick, currentPlaylists, currentTracks } = useImportSpotify(spotifyPlaylists, selectedPlaylists);

  useEffect(() => {
    getSpotifyPlaylists().then(setSpotifyPlaylists)
  }, []);

  useEffect(() => {
    getTidalPlaylists().then(setTidalPlaylists)
  }, []);

  const onPlaylistSelect = (id: string, provider: Service) => {
    const isSelected = selectedPlaylists.some(p => p.id === id);
    // TODO: this is dumb and not extensible
    const setPlaylistsFn = provider === Service.Spotify ? spotifyPlaylists : tidalPlaylists;
    const thisPlaylist = setPlaylistsFn.find(p => p.id === id);
    const allButThisPlaylist = selectedPlaylists.filter(p => p.id !== id);

    if (!thisPlaylist) return;

    setImportSource(!isSelected || allButThisPlaylist.length ? provider : undefined);
    setSelectedPlaylists(prev => {
      if (provider !== importSource) return [thisPlaylist!];
      return isSelected ? allButThisPlaylist : [...prev, thisPlaylist!];
    });
  };


  return <div className="flex flex-col gap-5 items-center">
    <h1 className='text-center text-6xl'>Welcome!</h1>
    <div className='flex gap-2'>
      <PlaylistContainer
        playlists={spotifyPlaylists}
        selectedPlaylists={selectedPlaylists}
        onSelectAll={() => {
          setSelectedPlaylists(spotifyPlaylists);
          setImportSource(Service.Spotify);
        }}
        onPlaylistSelect={onPlaylistSelect}
        provider={Service.Spotify}
      />
      <PlaylistContainer
        playlists={tidalPlaylists}
        selectedPlaylists={selectedPlaylists}
        onSelectAll={() => {
          setSelectedPlaylists(tidalPlaylists);
          setImportSource(Service.Tidal);
        }}
        onPlaylistSelect={onPlaylistSelect}
        provider={Service.Tidal}
      />
    </div>
    <ImportButton importSource={importSource} onClick={onImportClick} />
    {!!currentPlaylists.length && currentPlaylists.map((p, i) => 
      <p key={i}>{p}: {currentTracks[i] ?? 'Unknown track'}</p>
    )}
  </div>;
}