import type { tidalApi } from "../../api-helpers/tidal";
import type { MinTrack } from "./useImportTracks";

type TidalGetTracksFn = typeof tidalApi.GET<
  '/searchResults/{id}/relationships/tracks',
  {params: {path: {id: string}, query: {include: ['tracks']}}}
>;

export const mapTidalTracksToUniversalTracks = (res: Awaited<ReturnType<TidalGetTracksFn>>) => {
  const minTracks = res.data?.data;
  const extraData = res.data?.included;

  const trackWithData = minTracks?.map(track => extraData?.find(a => a.id === track.id)) ?? [];

  const tidalTracks = trackWithData.map((t): MinTrack | undefined => {
    // Shouldn't happen (hopefully) - just for type coercion
    if (!t?.attributes || !('title' in t.attributes)) return;
    
    return {
      id: t.id ?? '',
      artistName: '',
      trackName: t.attributes.title ?? ''
    }
  }).filter(t => !!t);

  return tidalTracks;
}