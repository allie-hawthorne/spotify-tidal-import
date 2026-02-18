import type { Dispatch, SetStateAction } from "react";
import type { Service } from "../../components/LoginButton";
import type { Playlist } from "./Playlists";

interface PlaylistContainerProps {
  playlists: Playlist[]
  provider: Service
  selectedPlaylists: Playlist[]
  setSelectedPlaylists: Dispatch<SetStateAction<Playlist[]>>
}
export const PlaylistContainer = ({ playlists, provider, selectedPlaylists, setSelectedPlaylists }: PlaylistContainerProps) => {
  const onClick = (id: string) => {
    const isSelected = selectedPlaylists.some(p => p.id === id);
    if(isSelected) {
      setSelectedPlaylists(prev => prev.filter(p => p.id !== id));
      return;
    }
    setSelectedPlaylists(prev => [...prev, playlists.find(p => p.id === id)!]);
  }
    
  return <div className="bg-violet-500/50 p-2 rounded-3xl">
    <h4 className="text-center text-2xl">{provider} playlists</h4>
    <div className="h-50 w-96 overflow-scroll">
      {playlists && <ul className="flex flex-col gap-2 mt-2">
        {playlists.map(playlist => (
          <li className={`hover:opacity-60 cursor-pointer ${selectedPlaylists.includes(playlist) ? 'bg-violet-900/50' : ''}`} key={playlist.id} onClick={() => onClick(playlist.id)}>{playlist.name}</li>
        ))}
      </ul>}
    </div>
  </div>;
};