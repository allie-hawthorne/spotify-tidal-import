import { ImportStatus, type Playlist, type PlaylistForImport } from "../../types";
import { PlaylistTracksImportStatus } from "./PlaylistTracksImportStatus";

export const getColorClassForStatus = (status?: ImportStatus) => {
  switch (status) {
    case ImportStatus.Completed:
      return 'text-green-500';
    case ImportStatus.InProgress:
      return 'text-yellow-500';
    default:
      return 'text-gray-500';
  }
};

interface PlaylistImportStatusProps {
  selectedPlaylists: Playlist[];
  allPlaylists: PlaylistForImport[];
}
export const PlaylistImportStatus = ({ selectedPlaylists, allPlaylists }: PlaylistImportStatusProps) => {
  return <>
    <p>Imported Playlists:</p>
    <div className="grid grid-cols-2">
      {selectedPlaylists.map((p, i) => {
        const thisPlaylistTracks = allPlaylists.find(pl => pl.id === p.id);

        return <div key={i} className="border p-2">
        <p className={getColorClassForStatus(thisPlaylistTracks?.status)}> {p.name}</p>
        {thisPlaylistTracks
          ? <PlaylistTracksImportStatus playlistTracks={thisPlaylistTracks} />
          : <p>Loading tracks...</p>
        }
        <p>{p.name}: {thisPlaylistTracks?.items[0] ? `${thisPlaylistTracks.items[0].title} by ${thisPlaylistTracks.items[0].artists.join(', ')}` : 'No tracks'}</p>
      </div>
      })}
    </div>
  </>;
}