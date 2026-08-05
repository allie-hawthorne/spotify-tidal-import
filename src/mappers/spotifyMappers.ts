import type { Artist, PlaylistedTrack, SavedAlbum, SavedTrack, SimplifiedPlaylist, Track } from "@spotify/web-api-ts-sdk";
import type { IAlbum, IArtist, IBasePlaylist, ITrack } from "../types";
import { TIDAL_PLACEHOLDER_IMAGE_URL } from "../api-helpers/tidal";

export const mapSpotifyTracksToUniversalTracks = (tracks: (SavedTrack | PlaylistedTrack<Track>)[]) => {
  const spotifyTracks = tracks.map(({track}): ITrack | undefined => {
    return {
      id: track.id,
      artists: track.artists.map(a => a.name),
      trackName: track.name,
      isrc: track.external_ids.isrc
    }
  }).filter(t => !!t);

  return spotifyTracks;
};

export const mapSpotifyAlbumsToUniversalAlbums = (albums: SavedAlbum[]) => {
  const spotifyAlbums = albums.map(({album}): IAlbum | undefined => {
    return {
      id: album.id,
      artists: album.artists.map(artist => artist.name),
      albumName: album.name,
      barcode: album.external_ids.upc
    };
  }).filter(a => !!a);
  
  return spotifyAlbums;
};

export const mapSpotifyArtistsToUniversalArtists = (artists: Artist[]) => {  
  const tidalArtists = artists.map((a): IArtist => {
    return {
      id: a.id,
      artistName: a.name
    }
  });

  return tidalArtists;
};

export const mapSpotifyPlaylistToUniversalPlaylist = (playlist: SimplifiedPlaylist): IBasePlaylist => {
  return {
    id: playlist.id,
    playlistName: playlist.name,
    trackCount: playlist.tracks?.total ?? 0,
    imageUrl: playlist.images?.[0]?.url ?? TIDAL_PLACEHOLDER_IMAGE_URL
  }
};