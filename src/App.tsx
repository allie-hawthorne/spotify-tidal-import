import { useCallback, useEffect, useState } from 'react';
import { initialiseTidal, spotifyApi, tidalApi } from './ids'
import type { AccessToken } from '@spotify/web-api-ts-sdk';
import { SpotifyLoginButton } from './components/SpotifyLoginButton';
import { TidalLoginButton } from './components/TidalLoginButton';

function App() {
  const [spotifyToken, setSpotifyToken] = useState<AccessToken | null>(null)
  const [tidalToken] = useState<AccessToken | null>(null)

  useEffect(() => {
    spotifyApi.getAccessToken().then(setSpotifyToken).catch(console.error)
  }, []);

  useEffect(() => {
    initialiseTidal().then(() => console.log('Tidal authentication successful')).catch(console.error);
  }, []);

  const handleTidalClick = useCallback(() => {
    tidalApi.GET('/users/me').then(data => {
      console.log('Tidal authentication successful', data);
    }).catch(console.error)
  }, []);

  return <div className='flex flex-col gap-2'>
    <h1>Spotify Tidal Importer</h1>
    {spotifyToken
      ? <p>Logged in to Spotify!</p>
      : <SpotifyLoginButton />
    }
    {tidalToken
      ? <p>Logged in to Tidal!</p>
      : <TidalLoginButton />
    }
    <button onClick={handleTidalClick}>Click Mee</button>
  </div>
}

export default App
