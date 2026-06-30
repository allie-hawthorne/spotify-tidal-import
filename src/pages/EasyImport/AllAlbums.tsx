import { useSpotify } from "../../api-helpers/SpotifyContext"

export const AllAlbums = () => {
  const {albums, albumsLoading} = useSpotify()
    
  if (albumsLoading) return <p>loading saved albums...</p>
  if (!albums) return <p>We couldn't get your albums</p>

  return <p>Import {albums.length} saved albums</p>
}