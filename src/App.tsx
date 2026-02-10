import { useEffect, useState } from 'react';
import { spotifySdk } from './ids'
import type { AccessToken } from '@spotify/web-api-ts-sdk';
import { SpotityLoginButton } from './components/SpotityLoginButton';

function App() {
  const [accessToken, setAccessToken] = useState<AccessToken | null>(null)

  useEffect(() => {
    spotifySdk.getAccessToken().then(setAccessToken).catch(console.error)
  }, []);

  return <div>
    <h1>Spotify Tidal Importer</h1>
    {accessToken
      ? <p>Logged in with access token: {accessToken.access_token}</p>
      : <SpotityLoginButton />
    }
  </div>
}

export default App
