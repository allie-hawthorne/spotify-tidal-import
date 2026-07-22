import { useSpotify } from "../../api-helpers/SpotifyContext";
import { CollectionSummary } from "./CollectionSummary";
import type { MinTrack } from "./useImportTracks";

export const AllTracks = ({succeededTracks}: {succeededTracks: MinTrack[]}) => {
  const {tracks, tracksLoading, trackProgress, trackTotal} = useSpotify();

  return <CollectionSummary
    label="followed tracks"
    loading={tracksLoading}
    loadingTotal={trackTotal}
    loadingProgress={trackProgress}
    succeededCount={succeededTracks.length}
    itemCount={tracks.length}
  />;
}