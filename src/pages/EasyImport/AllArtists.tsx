import { useSpotify } from "../../api-helpers/SpotifyContext"
import type { MinArtist } from "./useImport"

export const AllArtists = ({succeededArtists}: {succeededArtists: MinArtist[]}) => {
  const {artists, artistsLoading, artistTotal, artistProgress} = useSpotify()
    
  if (artistsLoading) return <p>loading followed artists ({artistProgress}/{artistTotal})</p>
  if (!artists) return <p>We couldn't get your artists</p>

  return <p>Import {artists.length} followed artists {!!succeededArtists.length && `(${succeededArtists.length}/${artists.length})`}</p>
}