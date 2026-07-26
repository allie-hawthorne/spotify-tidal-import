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
      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsum, eum!</p>
      <Home />
    </ImporterProvider>
  </SpotifyProvider>;

  return <>
    <div className='mb-3'>
      <h3 className='text-5xl font-serif'>Free your music. For free.</h3>
      <p>Connect your Spotify and Tidal accounts to import your music collection.</p>
    </div>
    {spotifyAuthed || <SpotifyLoginButton />}
    {tidalAuthed || <TidalLoginButton />}
  </>
};
