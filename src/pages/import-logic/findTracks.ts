import chunk from "lodash/chunk";
import { matchTrack } from "./matching";
import type { ITrack } from "../../types";
import { MAX_ITEMS_PER_BATCH } from "../../api-helpers/tidal";
import type { TidalImporter } from "../../api-helpers/classes/TidalImporter";
import { cacheFail, cacheFromIsrc, cacheTrack, searchCache } from "./trackCache";

export interface ImportTracksParams {
  importer: TidalImporter,
  tracks: ITrack[],
  onFail: (tracks: ITrack[]) => void,
  onMatch: (tracks: ITrack[]) => Promise<void>
}

// Resolves Spotify tracks to their Tidal equivalents: batch ISRC lookup first (fast, exact),
// falling back to search + name matching for whatever the ISRC batch didn't find.
export const findTracks = async ({ tracks, ...rest }: ImportTracksParams) => {
  const { importer, onMatch } = rest;

  const chunks = chunk(tracks, MAX_ITEMS_PER_BATCH);
  for (const trackChunk of chunks) {
    const { cachedTracks, tracksToImport } = searchCache({tracks: trackChunk, ...rest});
    if (cachedTracks.length) await onMatch(cachedTracks);

    // I found two spotify tracks with the same ISRC: 45Vil8xFfibJfxbiAwFnb2 and 1sO676Anpdv0Y1wW6kxwvo
    // This highlights a bigger problem: ISRC isn't guaranteed to be trustworthy. I have no idea how to deal with this
    // TODO: We can at least move this check up, into SpotifyContext, and set ISRCs to null where there's duplication. This doesn't solve the case where an ISRC is shared with a track not also on the import however
    const uniqueIsrcTracks = tracksToImport.filter(ti => tracksToImport.filter(tj => tj.isrc === ti.isrc).length === 1);

    // If every track is in the cache we can skip
    if (!uniqueIsrcTracks.length) continue;

    const matchedTidalTracks = await importer.getTracksByIsrc(uniqueIsrcTracks.map(t => t.isrc));
    if (matchedTidalTracks.length) await onMatch(matchedTidalTracks);

    cacheFromIsrc(matchedTidalTracks, tracksToImport);

    const tidalIsrcs = matchedTidalTracks.map(t => t.isrc);
    const missingSpotifyTracks = tracksToImport.filter(t => !tidalIsrcs.includes(t.isrc));    
    if (missingSpotifyTracks.length) findMissingTracks({ tracks: missingSpotifyTracks, ...rest })
  };
};

const findMissingTracks = async ({ importer, onFail, onMatch, tracks }: ImportTracksParams) => {
  for (const track of tracks) {
    const searchResults = await importer.searchForTrack(track);

    if (!searchResults) {
      onFail([track]);
      continue;
    }

    const matchedTrack = matchTrack(track, searchResults);

    if (matchedTrack) {
      console.log("Missing track matched:", track, "found:", matchedTrack);
      await onMatch([matchedTrack]);
      cacheTrack(track.id, matchedTrack);
    } else {
      console.log("Missing track NOT matched:", track);
      cacheFail(track.id);
      onFail([track]);
    }
  }
}
