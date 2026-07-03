import { useSpotify } from "../../api-helpers/SpotifyContext"
import type { MinTrack } from "./useImportTracks"

export const AllTracks = ({succeededTracks}: {succeededTracks: MinTrack[]}) => {
  const {tracks, tracksLoading} = useSpotify()
    
  if (tracksLoading) return <p>loading followed tracks...</p>
  if (!tracks) return <p>We couldn't get your tracks</p>

  return <p>Import {tracks.length} followed tracks {!!succeededTracks.length && `(${succeededTracks.length}/${tracks.length})`}</p>
}