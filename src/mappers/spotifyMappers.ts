import type { SavedTrack } from "@spotify/web-api-ts-sdk";
import type { MinTrack } from "../pages/EasyImport/useImportTracks";

export const mapSpotifyTracksToUniversalTracks = (tracks: SavedTrack[]) => {
  const spotifyTracks = tracks.map(({track}): MinTrack | undefined => {
    return {
      id: track.id,
      artistName: track.artists.join(' '),
      trackName: track.name,
      isrc: track.external_ids.isrc
    }
  }).filter(t => !!t);

  return spotifyTracks;
}
