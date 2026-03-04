import type { PlaylistWithTracks } from "../../types";

interface PlaylistTracksImportStatusProps {
  playlistTracks: PlaylistWithTracks
}
export const PlaylistTracksImportStatus = ({ playlistTracks }: PlaylistTracksImportStatusProps) => {
  return <>
    <p>Tracks:</p>
    <ul>
      {playlistTracks.items.map((item, index) => (
        <li key={index}>{item.title} by {item.artists.join(', ')}</li>
      ))}
    </ul>
  </>;
}