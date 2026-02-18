import { useEffect, useState } from 'react';
import { spotifyApi } from './api-helpers/spotify';
import { checkIfTidalAuthed } from './api-helpers/tidal';
import { SpotifyLoginButton } from './components/SpotifyLoginButton';
import { TidalLoginButton } from './components/TidalLoginButton';
import { Home } from './pages/Playlists/Playlists';

export const AuthBarrier = () => {
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

  if (spotifyAuthed && tidalAuthed) return <Home />;

  return <div className='flex flex-col gap-2'>
    {spotifyAuthed || <SpotifyLoginButton />}
    {tidalAuthed || <TidalLoginButton />}
  </div>
};
