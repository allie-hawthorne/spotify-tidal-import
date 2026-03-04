import type { PlaylistWithItems } from "./Playlists";

interface PlaylistTracksImportStatusProps {
  playlistTracks: PlaylistWithItems
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