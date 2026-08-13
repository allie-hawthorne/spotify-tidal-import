import type { ITrack } from "../../types";
import type { ImportTracksParams } from "./findTracks";

type CacheMap = [string, ITrack | string][]

export const CACHE_KEY_PREFIX = 'spotify-track-cache'
const getKey = (id: string) => `${CACHE_KEY_PREFIX}:${id}`;

export const cache = (cacheMap: CacheMap) => {
  cacheMap.forEach(([sId, tTrack]) => localStorage.setItem(getKey(sId), JSON.stringify(tTrack)))
  console.log("Storing in cache:", cacheMap);
}

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

    if (data === 'undefined') onFail([t]);
    else if (data) cachedTracks.push(JSON.parse(data));
    else tracksToImport.push(t);
  });
  return { cachedTracks, tracksToImport };
}