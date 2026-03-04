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
  description: string;
  trackCount: number;
}
export interface PlaylistForImport extends Playlist {
  items: TrackForImport[];
  status: ImportStatus;
}
