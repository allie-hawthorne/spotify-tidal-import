import type { ITrack } from "../../types";
import type { ImportTracksParams } from "./findTracks";

const CACHE_KEY_PREFIX = 'spotify-track-cache';
const CACHE_MATCH_FAIL_MARKER = 'no-match';

const getKey = (id: string) => `${CACHE_KEY_PREFIX}:${id}`;

const cache = (id: string, val: string) => localStorage.setItem(getKey(id), val);
export const cacheTrack = (id: string, track: ITrack) => cache(id, JSON.stringify(track));
export const cacheFail = (id: string) => cache(id, CACHE_MATCH_FAIL_MARKER);

export const cacheFromIsrc = (tidalTracks: ITrack[], spotifyTracks: ITrack[]) => {
  tidalTracks.forEach(tt => {
    const spotifyTrack = spotifyTracks.find(st => st.isrc === tt.isrc);
    if (spotifyTrack) cacheTrack(spotifyTrack.id, tt);
  });
}

export const searchCache = ({tracks, onFail}: ImportTracksParams) => {
  const cachedTracks: ITrack[] = [];
  const tracksToImport: ITrack[] = [];
  tracks.forEach(t => {
    const data = localStorage.getItem(getKey(t.id));

    if (data === CACHE_MATCH_FAIL_MARKER) onFail([t]);
    else if (data) cachedTracks.push(JSON.parse(data));
    else tracksToImport.push(t);
  });
  return { cachedTracks, tracksToImport };
}