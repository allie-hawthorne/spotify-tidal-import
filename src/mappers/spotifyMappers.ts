import type { Artist, PlaylistedTrack, SavedAlbum, SavedShow, SavedTrack, SimplifiedPlaylist, Track } from "@spotify/web-api-ts-sdk";
import type { IAlbum, IArtist, IBasePlaylist, IPodcast, ITrack } from "../types";
import { TIDAL_PLACEHOLDER_IMAGE_URL } from "../api-helpers/tidal";

export const mapSpotifyTracksToUniversalTracks = (tracks: (SavedTrack | PlaylistedTrack<Track>)[]) => {
  const spotifyTracks = tracks.map(({track}): ITrack | undefined => {
    // During testing I found a single track in like 10,000 that was blank, might have been deleted? Should be removed
    if (!track.external_ids.isrc) return;
    return {
      id: track.id,
      artists: track.artists.map(a => a.name),
      trackName: track.name,
      isrc: track.external_ids.isrc.toLocaleUpperCase()
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

export const mapSpotifyShowsToUniversalPodcasts = (shows: SavedShow[]) => {
  const spotifyPodcasts = shows.map(({show}): IPodcast | undefined => {
    return {
      id: show.id,
      podcastName: show.name,
      publisher: show.publisher
    };
  }).filter(p => !!p);

  return spotifyPodcasts;
};

export const mapSpotifyPlaylistToUniversalPlaylist = (playlist: SimplifiedPlaylist): IBasePlaylist => {
  return {
    id: playlist.id,
    playlistName: playlist.name,
    trackCount: playlist.tracks?.total ?? 0,
    imageUrl: playlist.images?.[0]?.url ?? TIDAL_PLACEHOLDER_IMAGE_URL
  }
};