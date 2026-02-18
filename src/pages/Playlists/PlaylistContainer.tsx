import type { Service } from "../../components/LoginButton";

interface PlaylistContainerProps {
  playlists: string[]
  provider: Service
}
export const PlaylistContainer = ({ playlists, provider }: PlaylistContainerProps) => {
  return <div className="bg-violet-500/50 p-2 rounded-3xl">
        <h4 className="text-center text-2xl">{provider} playlists</h4>
        <div className="h-50 w-96 overflow-scroll">
          {playlists && <ul>
            {playlists.map(playlist => (
              <li key={playlist}>{playlist}</li>
            ))}
          </ul>}
        </div>
      </div>

}