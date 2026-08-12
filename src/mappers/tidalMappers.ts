import type { tidalApi } from "../api-helpers/tidal";
import type { IAlbum, IArtist, ITrack } from "../types";

type TidalGetTracksFn = typeof tidalApi.GET<
  '/tracks',
  {params: {query: {'filter[isrc]': string[]}}}
>;

type TidalSearchTracksFn = typeof tidalApi.GET<
  '/searchResults/{id}/relationships/tracks',
  {params: {path: {id: string}, query: {include: ['tracks']}}}
>;

type TidalGetAlbumsFn = typeof tidalApi.GET<
  '/albums',
  {params: {query: {'filter[barcodeId]': string[], include: ['artists']}}}
>;

type TidalSearchAlbumsFn = typeof tidalApi.GET<
  '/searchResults/{id}',
  {params: {path: {id: string}, query: {include: ['albums', 'albums.artists']}}}
>;

type TidalGetArtistsFn = typeof tidalApi.GET<
  '/searchResults/{id}/relationships/artists',
  {params: {path: {id: string}, query: {include: ['artists']}}}
>;

export const mapTidalTracksToUniversalTracks = (res: Awaited<ReturnType<TidalGetTracksFn | TidalSearchTracksFn>>) => {
  const minTracks = res.data?.data;
  const extraData = res.data?.included;

  const trackWithData = minTracks?.map(track => {
    if ("attributes" in track) return track;
    return extraData?.find(a => a.id === track.id);
  }) ?? [];

  const tidalTracks = trackWithData.map((t): ITrack | undefined => {
    // Shouldn't happen (hopefully) - just for type coercion
    if (!t?.attributes || !('isrc' in t.attributes)) return;

    return {
      id: t.id,
      artists: [],
      trackName: t.attributes.title,
      isrc: t.attributes.isrc
    }
  }).filter(t => !!t);
  
  return tidalTracks;
}

export const mapTidalAlbumsByBarcodeToUniversalAlbums = (res: Awaited<ReturnType<TidalGetAlbumsFn>>) => {  
  const minAlbums = res.data?.data;
  const extraData = res.data?.included;
  
  const orderedAlbumsWithArtists = (minAlbums ?? []).map(({id, attributes, relationships}): IAlbum | undefined => {
    if (!attributes || !relationships) return;

    const artists = relationships.artists.data?.flatMap(minArtist => extraData?.filter(a => a.id === minArtist.id));

    return {
      id,
      // @ts-expect-error - name does exist
      artists: artists?.map(artist => artist?.attributes?.name) ?? [],
      albumName: attributes.title,
      barcode: attributes.barcodeId
    };
  }).filter(a => !!a);
  
  return orderedAlbumsWithArtists;
}

export const mapTidalAlbumsToUniversalAlbums = (res: Awaited<ReturnType<TidalSearchAlbumsFn>>) => {  
  const minAlbums = res.data?.data;
  const extraData = res.data?.included;
  
  // relationships.albums.data is sorted by relevance so keeping this order is preferable over using included
  const orderedAlbums = minAlbums?.relationships?.albums.data ?? [];

  const orderedAlbumsWithArtists = orderedAlbums.map((minAlbum): IAlbum | undefined => {
    const album = extraData?.find(a => a.id === minAlbum.id);

    if (!album?.attributes || !("albumType" in album.attributes)) return;

    const relationships = "relationships" in album ? album.relationships : undefined;

    const minArtists = relationships && "artists" in relationships ? relationships.artists.data : undefined;

    const artists = minArtists?.flatMap(minArtist => extraData?.filter(a => a.id === minArtist.id));

    return {
      id: album?.id ?? '',
      // @ts-expect-error - name does exist
      artists: artists?.map(artist => artist?.attributes?.name) ?? [],
      albumName: album.attributes.title,
      barcode: album.attributes.barcodeId
    };
  }).filter(a => !!a);
  
  return orderedAlbumsWithArtists;
}

export const mapTidalArtistsToUniversalArtists = (res: Awaited<ReturnType<TidalGetArtistsFn>>) => {
  const minArtists = res.data?.data ?? [];
  const extraData = res.data?.included;
  
  const orderedArtists = minArtists.map(d => extraData?.find(a => a.id === d.id));

  const tidalArtists = orderedArtists.map((a): IArtist => ({
    id: a?.id ?? '',
    // @ts-expect-error - name does exist
    artistName: a?.attributes?.name as string
  }));
  
  return tidalArtists;
};
