import { useEffect, useState } from 'react';
import { spotifyApi } from './api-helpers/spotify';
import { checkIfTidalAuthed } from './api-helpers/tidal';
import { SpotifyLoginButton } from './components/SpotifyLoginButton';
import { TidalLoginButton } from './components/TidalLoginButton';
import { Home } from './pages/Home';
import { SpotifyProvider } from './api-helpers/SpotifyContext';
import { ImporterProvider } from './pages/EasyImport/ImportContext';

export const AuthBarrier = () => {
  const [spotifyAuthed, setSpotifyAuthed] = useState(false);
  const [tidalAuthed, setTidalAuthed] = useState(false);

  useEffect(() => {
    spotifyApi.getAccessToken()
      .then(token => setSpotifyAuthed(!!token))
      .catch(console.error);
    checkIfTidalAuthed()
      .then(setTidalAuthed)
      .catch(console.error);
  }, []);

  if (spotifyAuthed && tidalAuthed) return <SpotifyProvider>
    <ImporterProvider>
      <Home />
    </ImporterProvider>
  </SpotifyProvider>;

  return <div className='flex flex-col gap-2'>
    {spotifyAuthed || <SpotifyLoginButton />}
    {tidalAuthed || <TidalLoginButton />}
  </div>
};
