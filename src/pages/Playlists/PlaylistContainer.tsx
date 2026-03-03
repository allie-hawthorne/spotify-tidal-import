import type { Service } from "../../components/LoginButton";
import type { Playlist } from "./Playlists";

interface PlaylistContainerProps {
  playlists: Playlist[]
  provider: Service
  onSelectAll: () => void
  onPlaylistSelect: (id: string, provider: Service) => void
  selectedPlaylists: Playlist[]
}
export const PlaylistContainer = ({ playlists, provider, selectedPlaylists, onSelectAll, onPlaylistSelect }: PlaylistContainerProps) => {
  const onClick = (id: string) => onPlaylistSelect(id, provider);
  const getSelectedStyle = (playlist: Playlist) => selectedPlaylists.includes(playlist) ? 'bg-violet-900/50' : ''
  
  return <div className="bg-violet-500/50 p-2 rounded-md">
    <div className="relative">
      <h4 className="text-center text-2xl">{provider} playlists</h4>
      <div className="absolute right-0 top-0 bottom-0 bg-violet-400/50 hover:bg-violet-400/25 aspect-square rounded-md" onClick={onSelectAll} />
    </div>
    <div className="h-50 w-96 overflow-scroll">
      {playlists && <ul className="flex flex-col gap-2 mt-2">
        {playlists.map(playlist => (
          <li className={`hover:opacity-60 cursor-pointer ${getSelectedStyle(playlist)}`} key={playlist.id} onClick={() => onClick(playlist.id)}>
            <div className="flex justify-between items-center">
              <p>{playlist.name}</p>
              <p className="text-xs opacity-70">{playlist.trackCount ? `${playlist.trackCount}` : 'No'} tracks</p>
            </div>
          </li>
        ))}
      </ul>}
    </div>
  </div>;
};