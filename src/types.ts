interface Item {
  title: string;
  artists: string[];
};
export interface Playlist {
  id: string;
  name: string;
  description: string;
  trackCount: number;
}
export interface PlaylistWithItems extends Playlist {
  items: Item[];
}