import { useSpotify } from "../../api-helpers/SpotifyContext"
import type { MinAlbum } from "./useImportAlbums"

export const AllAlbums = ({succeededAlbums}: {succeededAlbums: MinAlbum[]}) => {
  const {albums, albumsLoading} = useSpotify()
    
  if (albumsLoading) return <p>loading saved albums...</p>
  if (!albums) return <p>We couldn't get your albums</p>

  return <p>Import {albums.length} saved albums {!!succeededAlbums.length && `(${succeededAlbums.length}/${albums.length})`}</p>
}