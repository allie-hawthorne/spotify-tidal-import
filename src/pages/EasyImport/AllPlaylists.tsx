import { useSpotify } from "../../api-helpers/SpotifyContext";

// TODO: Try to reuse this where possible
export const AllPlaylists = () => {
  const {playlists, playlistsLoading, playlistTotal, playlistProgress} = useSpotify()
  
  if (playlistsLoading) return <p>loading playlists ({playlistProgress}/{playlistTotal})</p>
  if (!playlists) return <p>We couldn't get your playlists</p>

  return <p>Import {playlists.length} playlists</p>
}