export enum ImportStatus {
  NotStarted = "Not Started",
  InProgress = "In Progress",
  Completed = "Completed",
}
interface Track {
  id: string;
  title: string;
  artists: string[];
};
export interface TrackForImport extends Track {
  status: ImportStatus;
}
export interface Playlist {
  id: string;
  name: string;
  trackCount: number;
  imageUrl: string;
}
export interface PlaylistWithItems extends Playlist {
  items: Track[];
}
export interface PlaylistForImport extends Playlist {
  items: TrackForImport[];
  status: ImportStatus;
}
