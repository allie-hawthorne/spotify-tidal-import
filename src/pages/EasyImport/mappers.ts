import type { tidalApi } from "../../api-helpers/tidal";
import type { MinArtist } from "./useImport";
import type { MinAlbum } from "./useImportAlbums";
import type { MinTrack } from "./useImportTracks";

type TidalGetTracksFn = typeof tidalApi.GET<
  '/searchResults/{id}/relationships/tracks',
  {params: {path: {id: string}, query: {include: ['tracks']}}}
>;

type TidalGetAlbumsFn = typeof tidalApi.GET<
  '/searchResults/{id}',
  {params: {path: {id: string}, query: {include: ['albums', 'albums.artists']}}}
>;

type TidalGetArtistsFn = typeof tidalApi.GET<
  '/searchResults/{id}/relationships/artists',
  {params: {path: {id: string}, query: {include: ['artists']}}}
>;

export const mapTidalTracksToUniversalTracks = (res: Awaited<ReturnType<TidalGetTracksFn>>) => {
  const minTracks = res.data?.data;
  const extraData = res.data?.included;

  const trackWithData = minTracks?.map(track => extraData?.find(a => a.id === track.id)) ?? [];

  const tidalTracks = trackWithData.map((t): MinTrack | undefined => {
    // Shouldn't happen (hopefully) - just for type coercion
    if (!t?.attributes || !('isrc' in t.attributes)) return;

    return {
      id: t.id,
      artistName: '',
      trackName: t.attributes.title,
      isrc: t.attributes.isrc
    }
  }).filter(t => !!t);

  return tidalTracks;
}

export const mapTidalAlbumsToUniversalAlbums = (res: Awaited<ReturnType<TidalGetAlbumsFn>>) => {
  const minAlbums = res.data?.data;
  const extraData = res.data?.included;

  // This is sorted by relevance
  const orderedAlbums = minAlbums?.relationships?.albums.data ?? [];

  const orderedAlbumsWithArtists = orderedAlbums.map(minAlbum => {
    const album = extraData?.find(a => a.id === minAlbum.id);

    if (!album?.attributes || !("albumType" in album.attributes)) return;

    const relationships = album && "relationships" in album ? album.relationships : undefined;

    const minArtists = relationships && "artists" in relationships ? relationships.artists.data : undefined;

    const artists = minArtists?.flatMap(minArtist => extraData?.filter(a => a.id === minArtist.id));
    
    return {...album, artists};
  });
  
  const tidalAlbums = orderedAlbumsWithArtists.map((a): MinAlbum => ({
    id: a?.id ?? '',
    // @ts-expect-error - name does exist
    artistName: a?.artists?.map(artist => artist?.attributes?.name).join(' ') ?? '',
    // @ts-expect-error - name does exist
    albumName: a?.attributes?.title as string
  }));

  return tidalAlbums;
}

export const mapTidalArtistsToUniversalArtists = (res: Awaited<ReturnType<TidalGetArtistsFn>>) => {
  const minArtists = res.data?.data ?? [];
  const extraData = res.data?.included;
  
  const orderedArtists = minArtists.map(d => extraData?.find(a => a.id === d.id));

  const tidalArtists = orderedArtists.map((a): MinArtist => ({
    id: a?.id ?? '',
    // @ts-expect-error - name does exist
    artistName: a?.attributes?.name as string
  }));
  
  return tidalArtists;
};
