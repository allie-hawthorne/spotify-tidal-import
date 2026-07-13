import { useSpotify } from "../../api-helpers/SpotifyContext";
import type { MinPlaylist } from "./useImportPlaylists";

// TODO: Try to reuse this where possible
export const AllPlaylists = ({succeededPlaylists}: {succeededPlaylists: MinPlaylist[]}) => {
  const {playlists, playlistsLoading, playlistTotal, playlistProgress} = useSpotify()
  
  if (playlistsLoading) return <p>loading playlists ({playlistProgress}/{playlistTotal})</p>
  if (!playlists) return <p>We couldn't get your playlists</p>

  return <p>Import {playlists.length} playlists {!!succeededPlaylists.length && `(${succeededPlaylists.length}/${playlists.length})`}</p>
}