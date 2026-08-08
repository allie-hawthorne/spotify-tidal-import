import type { tidalApi } from "../api-helpers/tidal";
import type { IAlbum, IArtist, ITrack } from "../types";

type TidalGetTracksFn = typeof tidalApi.GET<
  '/searchResults/{id}',
  {params: {path: {id: string}, query: {include: ['tracks', 'tracks.artists']}}}
>;

type TidalGetAlbumsFn = typeof tidalApi.GET<
  '/searchResults/{id}',
  {params: {path: {id: string}, query: {include: ['albums', 'albums.artists']}}}
>;

type TidalGetArtistsFn = typeof tidalApi.GET<
  '/searchResults/{id}/relationships/artists',
  {params: {path: {id: string}, query: {include: ['artists']}}}
>;

// Shared by tracks and albums: once the caller has narrowed down to the list of artist resource
// identifiers (`relationships.artists.data`), the actual artist resources (with `name` etc.) live
// in the response's top-level `included` array, keyed by id.
const resolveArtistNames = <T extends {id: string}>(
  artistIds: {id: string}[] | undefined,
  extraData: T[] | undefined,
): string[] => {
  const artists = artistIds?.map(({id}) => extraData?.find(item => item.id === id));

  return artists
    // @ts-expect-error - name does exist
    ?.map(artist => artist?.attributes?.name as string | undefined)
    .filter((name): name is string => !!name) ?? [];
};

export const mapTidalTracksToUniversalTracks = (res: Awaited<ReturnType<TidalGetTracksFn>>) => {
  const searchResult = res.data?.data;
  const extraData = res.data?.included;

  // This is sorted by relevance
  const orderedTracks = searchResult?.relationships?.tracks.data ?? [];

  const tidalTracks = orderedTracks.map((minTrack): ITrack | undefined => {
    const track = extraData?.find(a => a.id === minTrack.id);

    // Shouldn't happen (hopefully) - just for type coercion
    if (!track?.attributes || !('isrc' in track.attributes)) return;

    const relationships = "relationships" in track ? track.relationships : undefined;
    const minArtists = relationships && "artists" in relationships ? relationships.artists.data : undefined;

    return {
      id: track.id,
      artists: resolveArtistNames(minArtists, extraData),
      trackName: track.attributes.title,
      isrc: track.attributes.isrc
    }
  }).filter(t => !!t);

  return tidalTracks;
}

export const mapTidalAlbumsToUniversalAlbums = (res: Awaited<ReturnType<TidalGetAlbumsFn>>) => {
  const minAlbums = res.data?.data;
  const extraData = res.data?.included;

  // This is sorted by relevance
  const orderedAlbums = minAlbums?.relationships?.albums.data ?? [];

  const orderedAlbumsWithArtists = orderedAlbums.map((minAlbum): IAlbum | undefined => {
    const album = extraData?.find(a => a.id === minAlbum.id);

    if (!album?.attributes || !("albumType" in album.attributes)) return;

    const relationships = "relationships" in album ? album.relationships : undefined;
    const minArtists = relationships && "artists" in relationships ? relationships.artists.data : undefined;

    return {
      id: album?.id ?? '',
      artists: resolveArtistNames(minArtists, extraData),
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
