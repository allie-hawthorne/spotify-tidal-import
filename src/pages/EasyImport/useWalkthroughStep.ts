import { useSpotify } from "../../api-helpers/SpotifyContext";
import { useImporterContext } from "./ImportContext";

export const WalkthroughStep = {
  Sync: 'sync',
  Select: 'select',
  Importing: 'importing',
  Paused: 'paused',
  Done: 'done',
} as const;
export type WalkthroughStepValue = typeof WalkthroughStep[keyof typeof WalkthroughStep];

// A category with nothing selected doesn't block completion; otherwise "done" means every
// item has an outcome (succeeded or errored) - anything left unattempted means it was
// interrupted (tab closed, page reloaded) rather than actually finished.
const isCategoryComplete = (shouldImport: boolean, succeededCount: number, erroredCount: number, total: number) =>
  !shouldImport || succeededCount + erroredCount >= total;

// Derives the walkthrough step purely from existing import/sync state, so it never drifts
// out of sync with what's actually happening - no separate "step" state to maintain.
export const useWalkthroughStep = (): WalkthroughStepValue => {
  const {isLoading, trackData, albumData, artistData, totalPlaylistTracks} = useSpotify();
  const {
    isImporting,
    shouldImportAlbums, shouldImportArtists, shouldImportTracks, shouldImportPlaylists,
    succeededAlbums, erroredAlbums,
    succeededArtists, erroredArtists,
    succeededTracks, erroredTracks,
    succeededPlaylistTracks, erroredPlaylistTracks,
  } = useImporterContext();

  if (isLoading) return WalkthroughStep.Sync;
  if (isImporting) return WalkthroughStep.Importing;

  const hasAnyResult =
    succeededAlbums.length > 0 || erroredAlbums.length > 0 ||
    succeededArtists.length > 0 || erroredArtists.length > 0 ||
    succeededTracks.length > 0 || erroredTracks.length > 0 ||
    Object.keys(succeededPlaylistTracks).length > 0 || Object.keys(erroredPlaylistTracks).length > 0;

  // Note: results persist across sessions now, so a returning user who already
  // completed an import will land on "Done"/"Paused" immediately rather than "Select".
  if (!hasAnyResult) return WalkthroughStep.Select;

  const succeededPlaylistTrackCount = Object.values(succeededPlaylistTracks).reduce((sum, p) => sum + p.tracks.length, 0);
  const erroredPlaylistTrackCount = Object.values(erroredPlaylistTracks).reduce((sum, p) => sum + p.tracks.length, 0);

  const allComplete =
    isCategoryComplete(shouldImportAlbums, succeededAlbums.length, erroredAlbums.length, albumData.items.length) &&
    isCategoryComplete(shouldImportArtists, succeededArtists.length, erroredArtists.length, artistData.items.length) &&
    isCategoryComplete(shouldImportTracks, succeededTracks.length, erroredTracks.length, trackData.items.length) &&
    isCategoryComplete(shouldImportPlaylists, succeededPlaylistTrackCount, erroredPlaylistTrackCount, totalPlaylistTracks);

  return allComplete ? WalkthroughStep.Done : WalkthroughStep.Paused;
};
