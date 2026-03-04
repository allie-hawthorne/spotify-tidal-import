import { useMemo } from "react";
import { ImportStatus, type Playlist, type PlaylistForImport } from "../../types";

interface PlaylistImportStatusProps {
  selectedPlaylists: Playlist[];
  allPlaylists: PlaylistForImport[];
}
export const PlaylistImportStatus = ({ selectedPlaylists, allPlaylists }: PlaylistImportStatusProps) => {
  const currentlyImportingPlaylists = useMemo(() => {
    return allPlaylists
      .filter(p => p.status === ImportStatus.InProgress)
      .map(p => `${p.name}: ${p.items.filter(i => i.status !== ImportStatus.NotStarted).length}/${p.items.length} tracks`);
  }, [allPlaylists]);

  const completedTracksCount = useMemo(() => {
    return allPlaylists.reduce((count, playlist) => {
      const completedTracks = playlist.items.filter(item => item.status !== ImportStatus.NotStarted).length;
      return count + completedTracks;
    }, 0);
  }, [allPlaylists]);
  
  const totalTrackCount = useMemo(() => {
    return selectedPlaylists.reduce((count, playlist) => count + playlist.trackCount, 0);
  }, [selectedPlaylists]);

  return <div className="flex flex-col gap-5 items-center">
    <p>Importing...</p>
    {currentlyImportingPlaylists && <ul>
      {currentlyImportingPlaylists.map((playlist, index) => <li key={index}>{playlist}</li>)}
    </ul>}
    {completedTracksCount
      ? <p className="font-bold">Tracks imported: {completedTracksCount} of {totalTrackCount}</p>
      : <p>Tracks to import: {totalTrackCount}</p>
    }
    <div className="w-md bg-pink-600 rounded-2xl">
      <div className="h-10 bg-pink-400 rounded-2xl" style={{ width: `${(completedTracksCount / totalTrackCount) * 100}%` }} />
    </div>
    <p className="text-center">{Math.round((completedTracksCount / totalTrackCount) * 100)}%</p>
  </div>;
}