import { useSpotify } from "../../api-helpers/SpotifyContext"

export const AllTracks = () => {
  const {tracks, tracksLoading} = useSpotify()
    
  if (tracksLoading) return <p>loading followed tracks...</p>
  if (!tracks) return <p>We couldn't get your tracks</p>

  return <p>Import {tracks.length} followed tracks</p>
}