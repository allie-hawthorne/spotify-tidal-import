import type { MinArtist } from "./useImport";
import type { MinAlbum } from "./useImportAlbums";
import type { MinTrack } from "./useImportTracks";

export const symbolRegex = /[`~!@#$£€%^&*()_|+\-=?;:'",.<>{}[\]\\/]/gi;

const normalizeName = (name: string) => name.toLocaleUpperCase().replace(symbolRegex, '');

// could improve but the array length is like 10 max, and it early returns
// we're doing three loops because we want to prioritise matching names rather than array index
const matchByName = <T>(spotifyName: string, items: T[], getName: (item: T) => string): T | undefined => {
  const normalizedSpotify = normalizeName(spotifyName);
  const upperSpotify = spotifyName.toLocaleUpperCase();

  for (const item of items) {
    const name = getName(item);
    if (spotifyName === name) return item;
  }

  for (const item of items) {
    const name = getName(item).toLocaleUpperCase();
    if (upperSpotify === name) return item;
  }

  for (const item of items) {
    const name = normalizeName(getName(item));
    if (normalizedSpotify === name) return item;
  }
}

export const matchTrack = (spotifyTrack: MinTrack, tidalTracks: MinTrack[]) => {
  const isrcTrack = tidalTracks.find(t => t.isrc === spotifyTrack.isrc);
  if (isrcTrack) return isrcTrack;
  return matchByName(spotifyTrack.trackName, tidalTracks, tidalTrack => tidalTrack.trackName)
};

export const matchAlbum = (spotifyAlbum: MinAlbum, tidalAlbums: MinAlbum[]) => {
  const barcodeAlbum = tidalAlbums.find(t => t.barcode === spotifyAlbum.barcode);
  if (barcodeAlbum) return barcodeAlbum;
  return matchByName(spotifyAlbum.albumName, tidalAlbums, tidalAlbum => tidalAlbum.albumName)
};

export const matchArtist = (spotifyName: string, tidalArtists: MinArtist[]) => {
  return matchByName(spotifyName, tidalArtists, tidalArtist => tidalArtist.artistName)
};
