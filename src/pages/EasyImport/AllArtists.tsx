import { useSpotify } from "../../api-helpers/SpotifyContext"

export const AllArtists = () => {
  const {artists, artistsLoading} = useSpotify()
    
  if (artistsLoading) return <p>loading followed artists...</p>
  if (!artists) return <p>We couldn't get your artists</p>

  return <p>Import {artists.length} followed artists</p>
}