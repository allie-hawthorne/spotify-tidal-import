import { PlaylistState, useSpotify } from "../../api-helpers/SpotifyContext";
import type { PlaylistTracksMap } from "./useImportPlaylists";

// TODO: Try to reuse this where possible
export const AllPlaylists = ({succeededPlaylistTracks}: {succeededPlaylistTracks: PlaylistTracksMap}) => {
  const {playlists, playlistsLoading, playlistTotal, playlistProgress, playlistState} = useSpotify()
  
  if (playlistsLoading) return <p>loading {playlistState === PlaylistState.Tracks && 'tracks from'} playlists ({playlistProgress}/{playlistTotal})</p>
  if (!playlists) return <p>We couldn't get your playlists</p>
  
  const playlistCount = Object.entries(succeededPlaylistTracks).length

  return <p>Import {playlists.length} playlists {!!playlistCount && `(${playlistCount}/${playlists.length})`}</p>
}