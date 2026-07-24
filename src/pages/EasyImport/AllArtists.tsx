import { useSpotify } from "../../api-helpers/SpotifyContext";
import { CollectionSummary } from "./CollectionSummary";
import type { MinArtist } from "./ImportContext";

export const AllArtists = ({succeededArtists}: {succeededArtists: MinArtist[]}) => {
  const {artists, artistsLoading, artistTotal, artistProgress} = useSpotify();

  return <CollectionSummary
    label="followed artists"
    loading={artistsLoading}
    loadingTotal={artistTotal}
    loadingProgress={artistProgress}
    succeededCount={succeededArtists.length}
    itemCount={artists.length}
  />;
}