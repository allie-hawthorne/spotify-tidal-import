import type { Dispatch, SetStateAction } from "react";
import type { ITrack } from "./pages/EasyImport/useImportTracks";

export type SetNumberFn = Dispatch<SetStateAction<number>>;

export enum ImportStatus {
  NotStarted = "Not Started",
  InProgress = "In Progress",
  Completed = "Completed",
}
export interface IPlaylist {
  id: string;
  playlistName: string;
  trackCount: number;
  imageUrl: string;
  tracks: ITrack[];
}
export type IBasePlaylist = Omit<IPlaylist, 'tracks'>;