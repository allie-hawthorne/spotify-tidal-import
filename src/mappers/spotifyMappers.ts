import type { Artist, PlaylistedTrack, SavedAlbum, SavedTrack, SimplifiedPlaylist, Track } from "@spotify/web-api-ts-sdk";
import type { MinTrack } from "../pages/EasyImport/useImportTracks";
import type { MinAlbum } from "../pages/EasyImport/useImportAlbums";
import type { MinArtist } from "../pages/EasyImport/useImport";
import type { Playlist } from "../types";
import { TIDAL_PLACEHOLDER_IMAGE_URL } from "../api-helpers/tidal";

export const mapSpotifyTracksToUniversalTracks = (tracks: (SavedTrack | PlaylistedTrack<Track>)[]) => {
  const spotifyTracks = tracks.map(({track}): MinTrack | undefined => {
    return {
      id: track.id,
      artistName: track.artists.map(a => a.name).join(' '),
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

export const mapSpotifyArtistsToUniversalArtists = (artists: Artist[]) => {  
  const tidalArtists = artists.map((a): MinArtist => {
    return {
      id: a.id,
      artistName: a.name
    }
  });

  return tidalArtists;
};

export const mapSpotifyPlaylistToUniversalPlaylist = (playlist: SimplifiedPlaylist): Playlist => {
  return {
    id: playlist.id,
    playlistName: playlist.name,
    trackCount: playlist.tracks?.total ?? 0,
    imageUrl: playlist.images?.[0]?.url ?? TIDAL_PLACEHOLDER_IMAGE_URL
  }
};