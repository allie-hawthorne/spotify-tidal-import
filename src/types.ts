interface Track {
  title: string;
  artists: string[];
};
export interface Playlist {
  id: string;
  name: string;
  description: string;
  trackCount: number;
}
export interface PlaylistWithTracks extends Playlist {
  items: Track[];
}