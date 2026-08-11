import { createAPIClient } from '@tidal-music/api';
import { credentialsProvider, init, initializeLogin, logout } from '@tidal-music/auth';

const TIDAL_API_KEY = 'OPapoZjLFp4nJoEM';
const TIDAL_REDIRECT_URI = `${import.meta.env.VITE_REDIRECT_URL}/tidal/`;
// Use this as placeholder image everywhere to ensure consistency
export const TIDAL_PLACEHOLDER_IMAGE_URL = 'https://resources.tidal.com/images/e9448a9a/3ade/4f79/93d2/12e6d8d4b2eb/160x160.jpg'

const tidalParams = {
  clientId: TIDAL_API_KEY,
  credentialsStorageKey: 'authorisationCode',
  scopes: ['collection.read', 'collection.write', 'playlists.read', 'playlists.write', 'user.read'], 
};

export const tidalApi = createAPIClient(credentialsProvider);
export const checkIfTidalAuthed = async () => {
  await init(tidalParams);
  const response = await tidalApi.GET('/users/me');
  if (!response || 'error' in response) {
    console.log('Tidal authentication check failed. Try (re)logging into Tidal');
    return false;
  }
  return 'data' in response;
};
export const authenticateTidal = async () => {
  // We need these on the static redirect page
  localStorage.setItem('tidalClientId', TIDAL_API_KEY);
  localStorage.setItem('redirectUri', import.meta.env.VITE_REDIRECT_URL);

  const loginUrl = await initializeLogin({redirectUri: TIDAL_REDIRECT_URI});

  window.open(loginUrl, '_self');
}

export const logoutTidal = logout;

