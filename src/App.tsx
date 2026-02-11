import { useEffect, useState } from 'react';
import { spotifyApi } from './ids'
import type { AccessToken } from '@spotify/web-api-ts-sdk';
import { SpotifyLoginButton } from './components/SpotifyLoginButton';

function App() {
  const [spotifyToken, setSpotifyToken] = useState<AccessToken | null>(null)

  useEffect(() => {
    spotifyApi.getAccessToken().then(setSpotifyToken).catch(console.error)
  }, []);

  return <div className='flex flex-col gap-2'>
    <h1>Spotify Tidal Importer</h1>
    {spotifyToken
      ? <p>Logged in to Spotify!</p>
      : <SpotifyLoginButton />
    }
  </div>
}

export default App
