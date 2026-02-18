import type { Service } from "../../components/LoginButton";
import type { Playlist } from "./Playlists";

interface PlaylistContainerProps {
  playlists: Playlist[]
  provider: Service
}
export const PlaylistContainer = ({ playlists, provider }: PlaylistContainerProps) => {
  return <div className="bg-violet-500/50 p-2 rounded-3xl">
        <h4 className="text-center text-2xl">{provider} playlists</h4>
        <div className="h-50 w-96 overflow-scroll">
          {playlists && <ul className="flex flex-col gap-2 mt-2">
            {playlists.map(playlist => (
              <li className="hover:opacity-60" key={playlist.id}>{playlist.name}</li>
            ))}
          </ul>}
        </div>
      </div>

}