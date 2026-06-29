import { useEffect, useState } from "react";
import { getSpotifySavedArtists } from "../../api-helpers/spotify";
import type { Artist } from "@spotify/web-api-ts-sdk";

export const AllArtists = () => {
  const [spotifyArtists, setSpotifyArtists] = useState<Artist[]>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSpotifySavedArtists().then(p => {
      setSpotifyArtists(p);
      setLoading(false);
    })
  }, []);

  if (loading) return <p>loading followed artists...</p>
  if (!spotifyArtists) return <p>We couldn't get your artists</p>

  return <p>Import {spotifyArtists.length} followed artists</p>
}