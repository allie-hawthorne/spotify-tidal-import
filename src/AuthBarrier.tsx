import { useEffect, useState } from 'react';
import { spotifyApi } from './api-helpers/spotify';
import { checkIfTidalAuthed, logoutTidal } from './api-helpers/tidal';
import { SpotifyLoginButton } from './components/buttons/SpotifyLoginButton';
import { TidalLoginButton } from './components/buttons/TidalLoginButton';
import { Home } from './pages/Home';
import { SpotifyProvider } from './api-helpers/SpotifyContext';
import { ImporterProvider } from './pages/EasyImport/ImportContext';
import { IconButton } from './components/buttons/IconButton';
import LogoutIcon from 'mdi-react/LogoutIcon';
import { Walkthrough } from './components/Walkthrough';

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

  const handleLogout = () => {
    spotifyApi.logOut();
    logoutTidal();
    setSpotifyAuthed(false);
    setTidalAuthed(false);
  };

  const isAuthed = spotifyAuthed && tidalAuthed;

  return <>
    <div className="flex justify-between items-center">
      <h1 className="text-2xl">Spotifree</h1>
      {isAuthed && <IconButton className='enabled:text-red-400' icon={LogoutIcon} onClick={handleLogout} />}
    </div>
    {isAuthed ? <SpotifyProvider>
      <ImporterProvider>
        <Walkthrough />
        <Home />
      </ImporterProvider>
    </SpotifyProvider> : <>
      <div className='flex flex-col gap-2 mb-1'>
        <div className='text-5xl font-playfair font-semibold'>
          <h3>Free your music.</h3>
          <h3>For free.</h3>
        </div>
        <p>Connect your Spotify and Tidal accounts to import your music collection.</p>
      </div>
      <hr className='text-gray-700' />
      <div className='flex flex-col gap-4 mt-2'>
        {spotifyAuthed || <SpotifyLoginButton />}
        {tidalAuthed || <TidalLoginButton />}
      </div>
    </>}
  </>
};
