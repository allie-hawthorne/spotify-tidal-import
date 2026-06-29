import { useEffect, useMemo, useState } from "react";
import { getSpotifyPlaylists } from "../../api-helpers/spotify";
import type { Playlist } from "../../types";

// TODO: Try to reuse this where possible
export const AllPlaylists = () => {
    const [spotifyPlaylists, setSpotifyPlaylists] = useState<Playlist[]>([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      getSpotifyPlaylists().then(p => {
        setSpotifyPlaylists(p);
        setLoading(false);
      })
    }, []);

    const {totalPlaylists, totalTracks} = useMemo(() => {
      if (!spotifyPlaylists.length) return {};

      return {
        totalPlaylists: spotifyPlaylists.length,
        totalTracks: spotifyPlaylists.reduce((c, playlist) => c + playlist.trackCount, 0)
      }
    }, [spotifyPlaylists]);

    if (loading) return <p>loading playlists...</p>
    if (!totalPlaylists) return <p>We couldn't get your playlists</p>

    return <p>Import {totalTracks} tracks from {totalPlaylists} playlists</p>
}