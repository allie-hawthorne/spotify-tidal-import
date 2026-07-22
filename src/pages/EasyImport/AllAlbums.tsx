import { useSpotify } from "../../api-helpers/SpotifyContext";
import { CollectionSummary } from "./CollectionSummary";
import type { MinAlbum } from "./useImportAlbums";

export const AllAlbums = ({succeededAlbums}: {succeededAlbums: MinAlbum[]}) => {
  const {albums, albumsLoading, albumProgress, albumTotal} = useSpotify();

  return <CollectionSummary
    label="saved albums"
    loading={albumsLoading}
    loadingTotal={albumTotal}
    loadingProgress={albumProgress}
    succeededCount={succeededAlbums.length}
    itemCount={albums.length}
  />;
}