import { useSpotify } from "../../api-helpers/SpotifyContext"
import type { MinArtist } from "./useEasyImport"

export const AllArtists = ({succeededArtists}: {succeededArtists: MinArtist[]}) => {
  const {artists, artistsLoading} = useSpotify()
    
  if (artistsLoading) return <p>loading followed artists...</p>
  if (!artists) return <p>We couldn't get your artists</p>

  return <p>Import {artists.length} followed artists {!!succeededArtists.length && `(${succeededArtists.length}/${artists.length})`}</p>
}