import type { Playlist, TrackItem } from "@spotify/web-api-ts-sdk";
import type { Service } from "../../components/LoginButton";

interface PlaylistContainerProps {
  playlists?: Playlist<TrackItem>[]
  provider: Service
}
export const PlaylistContainer = ({ playlists, provider }: PlaylistContainerProps) => {
  return <div className="bg-violet-500/50 p-2 rounded">
        <h4 className="text-center text-2xl">{provider} playlists</h4>
        <div className="max-h-50 max-w-96 overflow-scroll">
          {playlists && <ul>
            {playlists.map(playlist => (
              <li key={playlist.id}>{playlist.name}</li>
            ))}
          </ul>}
        </div>
      </div>

}