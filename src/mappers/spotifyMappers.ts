import type { SavedAlbum, SavedTrack } from "@spotify/web-api-ts-sdk";
import type { MinTrack } from "../pages/EasyImport/useImportTracks";
import type { MinAlbum } from "../pages/EasyImport/useImportAlbums";

export const mapSpotifyTracksToUniversalTracks = (tracks: SavedTrack[]) => {
  const spotifyTracks = tracks.map(({track}): MinTrack | undefined => {
    return {
      id: track.id,
      artistName: track.artists.join(' '),
      trackName: track.name,
      isrc: track.external_ids.isrc
    }
  }).filter(t => !!t);

  return spotifyTracks;
};

export const mapSpotifyAlbumsToUniversalAlbums = (albums: SavedAlbum[]) => {
  const spotifyAlbums = albums.map(({album}): MinAlbum | undefined => {
    return {
      id: album.id,
      artistName: album.artists.map(artist => artist.name).join(' ') ?? '',
      albumName: album.name,
      barcode: album.external_ids.upc
    };
  }).filter(a => !!a);
  
  return spotifyAlbums;
};
