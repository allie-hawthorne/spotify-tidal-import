import type { Dispatch, SetStateAction } from "react";

interface Id {
  id: string;
}

interface ArtistArray {
  artists: string[];
}

export type IBasePlaylist = Omit<IPlaylist, 'tracks'>;
export interface IPlaylist {
  id: string;
  playlistName: string;
  trackCount: number;
  imageUrl: string;
  tracks: ITrack[];
}

export interface IArtist extends Id {
  artistName: string;
}

export interface IAlbum extends Id, ArtistArray {
  albumName: string;
  barcode: string;
}

export interface ITrack extends Id, ArtistArray {
  trackName: string;
  isrc: string;
}

export interface IPodcast extends Id {
  podcastName: string;
  publisher: string;
}

export type SetNumberFn = Dispatch<SetStateAction<number>>;
