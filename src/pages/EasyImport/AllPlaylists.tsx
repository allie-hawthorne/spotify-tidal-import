import { PlaylistState, useSpotify } from "../../api-helpers/SpotifyContext";
import { CollectionSummary } from "./CollectionSummary";
import type { PlaylistTracksMap } from "./useImportPlaylists";

export const AllPlaylists = ({succeededPlaylistTracks}: {succeededPlaylistTracks: PlaylistTracksMap}) => {
  const {playlists, playlistsLoading, playlistTotal, playlistProgress, playlistState} = useSpotify();
  const playlistCount = Object.entries(succeededPlaylistTracks).length;

  const label = `${playlistState === PlaylistState.Tracks ? "tracks from" : ""} playlists`
  
  return <CollectionSummary
    label={label}
    loading={playlistsLoading}
    loadingTotal={playlistTotal}
    loadingProgress={playlistProgress}
    succeededCount={playlistCount}
    itemCount={playlists.length}
  />;
}