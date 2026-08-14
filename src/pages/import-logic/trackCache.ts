import type { ITrack } from "../../types";
import type { ImportTracksParams } from "./findTracks";

type CacheMap = [string, ITrack | string][]

const CACHE_KEY_PREFIX = 'spotify-track-cache';
const CACHE_MATCH_FAIL_MARKER = 'no-match';

const getKey = (id: string) => `${CACHE_KEY_PREFIX}:${id}`;

const cache = (cacheMap: CacheMap) => {
  cacheMap.forEach(([sId, tTrack]) => {
    const cacheString = typeof tTrack === "string" ? tTrack : JSON.stringify(tTrack);
    localStorage.setItem(getKey(sId), cacheString);
  });
};
export const cacheFail = (id: string) => cache([[id, CACHE_MATCH_FAIL_MARKER]]);
export const cacheTrack = (id: string, track: ITrack) => cache([[id, track]]);

export const cacheFromIsrc = (tidalTracks: ITrack[], spotifyTracks: ITrack[]) => {
  const cacheMap: CacheMap = [];
  tidalTracks.forEach(tt => {
    const spotifyTrack = spotifyTracks.find(st => st.isrc === tt.isrc);
    if (!spotifyTrack) return;
    cacheMap.push([spotifyTrack.id, tt])
  });

  cache(cacheMap);
}

export const searchCache = ({tracks, onFail}: ImportTracksParams) => {
  const cachedTracks: ITrack[] = [];
  const tracksToImport: ITrack[] = [];
  tracks.forEach(t => {
    const data = localStorage.getItem(`${CACHE_KEY_PREFIX}:${t.id}`);

    if (data === CACHE_MATCH_FAIL_MARKER) onFail([t]);
    else if (data) cachedTracks.push(JSON.parse(data));
    else tracksToImport.push(t);
  });
  return { cachedTracks, tracksToImport };
}