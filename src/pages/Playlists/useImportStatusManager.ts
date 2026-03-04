import { useState } from "react";
import { ImportStatus, type PlaylistForImport } from "../../types";

export const useImportStatusManager = () => {
  const [allPlaylists, setAllPlaylists] = useState<PlaylistForImport[]>([]);
  
  const addAllPlaylists = (playlists: PlaylistForImport[]) => setAllPlaylists(playlists);
  
  const updatePlaylistStatus = (playlists: PlaylistForImport[], status = ImportStatus.InProgress) => {
    setAllPlaylists(prev => {
        const newPrev = [...prev];
        playlists.forEach(({id}) => {
          const playlistIndex = newPrev.findIndex(p => p.id === id);
          if (playlistIndex === -1) return;
          newPrev[playlistIndex] = {...newPrev[playlistIndex], status};
        });
        return newPrev;
      });
  };
  
  const updateTrackStatus = (playlistId: string, trackId: string, status = ImportStatus.InProgress) => {
    setAllPlaylists(prev => {
      const newPrev = [...prev];
      const thisPlaylistIndex = newPrev.findIndex(p => p.id === playlistId);
      if (thisPlaylistIndex === -1) return newPrev;

      const thisPlaylist = newPrev[thisPlaylistIndex];

      const thisTrackIndex = thisPlaylist.items.findIndex(i => i.id === trackId);            
      if (thisTrackIndex === -1) return newPrev;
      
      const thisTrack = thisPlaylist.items[thisTrackIndex];
      
      newPrev[thisPlaylistIndex].items[thisTrackIndex] = {
        ...thisTrack,
        status,
      };
      return newPrev;
    });
  };

  const markPlaylistCompleted = (playlistId: string) => {
    setAllPlaylists(prev => {
      const newPrev = [...prev];

      const playlistIndex = newPrev.findIndex(p => p.id === playlistId);
      if (playlistIndex === -1) return newPrev;

      newPrev[playlistIndex] = {
        ...newPrev[playlistIndex],
        status: ImportStatus.Completed,
        items: newPrev[playlistIndex].items.map(i => ({...i, status: ImportStatus.Completed}))
      };
      return newPrev;
    });
  };

  return {
      allPlaylists,
      addAllPlaylists,
      markPlaylistCompleted,
      updatePlaylistStatus,
      updateTrackStatus
  };
}