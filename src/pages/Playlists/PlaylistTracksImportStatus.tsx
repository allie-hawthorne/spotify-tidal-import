import type { PlaylistForImport } from "../../types";
import { getColorClassForStatus } from "./PlaylistImportStatus";

interface PlaylistTracksImportStatusProps {
  playlistTracks: PlaylistForImport
}
export const PlaylistTracksImportStatus = ({ playlistTracks }: PlaylistTracksImportStatusProps) => {
  return <>
    <p>Tracks:</p>
    <ul>
      {playlistTracks.items.map((item, index) => {
        return <li
          className={getColorClassForStatus(item.status)}
          key={index}
        >
          {item.title} by {item.artists.join(', ')}
        </li>
      })}
    </ul>
  </>;
}