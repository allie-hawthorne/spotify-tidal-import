import { useEffect, useState } from 'react';
import { spotifyApi } from './api-helpers/spotify';
import { checkIfTidalAuthed } from './api-helpers/tidal';
import { SpotifyLoginButton } from './components/SpotifyLoginButton';
import { TidalLoginButton } from './components/TidalLoginButton';

function App() {
  const [spotifyAuthed, setSpotifyAuthed] = useState(false);
  const [tidalAuthed, setTidalAuthed] = useState(false);

  useEffect(() => {
    spotifyApi.getAccessToken()
      .then(token => setSpotifyAuthed(!!token))
      .catch(console.error);
  }, []);

  useEffect(() => {
    checkIfTidalAuthed()
      .then(setTidalAuthed)
      .catch(console.error);
  }, []);

  return <div className='flex flex-col gap-2'>
    <h1>Spotify Tidal Importer</h1>
    {spotifyAuthed
      ? <p>Logged in to Spotify!</p>
      : <SpotifyLoginButton />
    }
    {tidalAuthed
      ? <p>Logged in to Tidal!</p>
      : <TidalLoginButton />
    }
  </div>
}

export default App
