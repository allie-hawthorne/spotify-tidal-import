import type { Dispatch, SetStateAction } from "react";
import type { MinTrack } from "./pages/EasyImport/useImportTracks";

export type SetNumberFn = Dispatch<SetStateAction<number>>;

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
  playlistName: string;
  trackCount: number;
  imageUrl: string;
}
export interface PlaylistWithItems extends Playlist {
  tracks: MinTrack[];
}
