import { useEffect, useState } from "react";
import { getSpotifyPlaylists } from "../../api-helpers/spotify";
import { getTidalPlaylists } from "../../api-helpers/tidal";
import { PlaylistContainer } from "./PlaylistContainer";
import { Service } from "../../components/LoginButton";
import { ImportButton } from "../../components/ImportButton";
import { useImportSpotify } from "./useImportSpotify";

export type PlaylistWithItems = Required<Playlist>
export interface Playlist {
  id: string;
  name: string;
  description: string;
  trackCount: number;
  items?: {title: string, artists: string[]}[];
}

export const Home = () => {
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<Playlist[]>([]);
  const [tidalPlaylists, setTidalPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylists, setSelectedPlaylists] = useState<Playlist[]>([]);
  const [importSource, setImportSource] = useState<Service>();
  const [showImportStatus, setShowImportStatus] = useState(false);

  const { onImportClick, allPlaylists } = useImportSpotify(spotifyPlaylists, selectedPlaylists, setShowImportStatus);

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


  if (showImportStatus) {
    // TODO: new component here
    return <>
      <p>Imported Playlists:</p>
      <div className="grid grid-cols-2">
        {selectedPlaylists.map((p, i) => {
          const thisPlaylistTracks = allPlaylists.find(pl => pl.id === p.id);

          return <div key={i} className="border p-2">
          <p>Playlist: {p.name}</p>
          {thisPlaylistTracks
            // TODO: new component here
            ? <div>
                <p>Tracks:</p>
                <ul>
                  {thisPlaylistTracks.items.map((item, index) => (
                    <li key={index}>{item.title} by {item.artists.join(', ')}</li>
                  ))}
                </ul>
            </div>
            : <p>Loading tracks...</p>
          }
          <p>{p.name}: {thisPlaylistTracks?.items[0] ? `${thisPlaylistTracks.items[0].title} by ${thisPlaylistTracks.items[0].artists.join(', ')}` : 'No tracks'}</p>
        </div>
        })}
      </div>
    </>;
  }
  
  return <div className="flex flex-col gap-5 items-center">
    <h1 className='text-center text-6xl'>Welcome!</h1>
    {/* TODO: New component here */}
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
  </div>;
}