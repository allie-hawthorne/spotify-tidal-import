import type { MinArtist } from "./useImport";
import type { MinAlbum } from "./useImportAlbums";
import type { MinTrack } from "./useImportTracks";

export const symbolRegex = /[`~!@#$£€%^&*()_|+\-=?;:'",.<>{}[\]\\/]/gi;

// can probably improve but the array length is like 10 max, and it early returns
// we're doing three loops because we want to prioritise matching names rather than array index
export const matchTrackNames = (spotifyName: string, tidalTracks: MinTrack[]) => {
  for (const tidalTrack of tidalTracks) {
    const tidalName = tidalTrack.trackName;
    if (spotifyName === tidalName) return tidalTrack;
  }
  for (const tidalTrack of tidalTracks) {
    const tidalName = tidalTrack.trackName.toLocaleUpperCase();
    if (spotifyName.toLocaleUpperCase() === tidalName) return tidalTrack;
  }
  for (const tidalTrack of tidalTracks) {
    const tidalName = tidalTrack.trackName.toLocaleUpperCase().replace(symbolRegex, '');
    if (spotifyName.toLocaleUpperCase().replace(symbolRegex, '') === tidalName) return tidalTrack;
  }
}

export const matchAlbumNames = (spotifyName: string, tidalAlbums: MinAlbum[]) => {
  for (const tidalAlbum of tidalAlbums) {
    const tidalName = tidalAlbum.albumName;
    if (spotifyName === tidalName) return tidalAlbum;
  }
  for (const tidalAlbum of tidalAlbums) {
    const tidalName = tidalAlbum.albumName.toLocaleUpperCase();
    if (spotifyName.toLocaleUpperCase() === tidalName) return tidalAlbum;
  }
  for (const tidalAlbum of tidalAlbums) {
    const tidalName = tidalAlbum.albumName.toLocaleUpperCase().replace(symbolRegex, '');
    if (spotifyName.toLocaleUpperCase().replace(symbolRegex, '') === tidalName) return tidalAlbum;
  }
}

export const matchArtistNames = (spotifyName: string, tidalArtists: MinArtist[]) => {
  for (const tidalArtist of tidalArtists) {
    const tidalName = tidalArtist.artistName;
    if (spotifyName === tidalName) return tidalArtist;
  }
  for (const tidalArtist of tidalArtists) {
    const tidalName = tidalArtist.artistName.toLocaleUpperCase();
    if (spotifyName.toLocaleUpperCase() === tidalName) return tidalArtist;
  }
  for (const tidalArtist of tidalArtists) {
    const tidalName = tidalArtist.artistName.toLocaleUpperCase().replace(symbolRegex, '');
    if (spotifyName.toLocaleUpperCase().replace(symbolRegex, '') === tidalName) return tidalArtist;
  }
}
