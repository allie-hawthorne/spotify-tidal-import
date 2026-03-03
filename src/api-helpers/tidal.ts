import { createAPIClient } from '@tidal-music/api';
import { credentialsProvider, init, initializeLogin } from '@tidal-music/auth';
import type { Playlist } from '../pages/Playlists/Playlists';

const TIDAL_API_KEY = 'TDiZl2ekSxNNwrYL';
const TIDAL_REDIRECT_URI = 'http://127.0.0.1:5500/tidal/';

const tidalParams = {
  clientId: TIDAL_API_KEY,
  credentialsStorageKey: 'authorisationCode',
  scopes: ['user.read', 'playlists.read', 'playlists.write'], 
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
  localStorage.setItem('tidalRedirectUri', TIDAL_REDIRECT_URI);

  const loginUrl = await initializeLogin({redirectUri: TIDAL_REDIRECT_URI});

  window.open(loginUrl, '_self');
}

type TidalPlaylistType = NonNullable<Awaited<ReturnType<typeof tidalApi.GET<'/playlists', {}>>>['data']>['data'][number];
const mapTidalPlaylistToPlaylist = (playlist: TidalPlaylistType): Playlist => ({
  id: playlist.id,
  name: playlist.attributes?.name ?? '',
  description: playlist.attributes?.description ?? '',
  trackCount: playlist.attributes?.numberOfItems ?? 0
});

export const getTidalPlaylists = async () => {
  // TODO: get user id from tidal api instead of hardcoding it
  const response = await tidalApi.GET('/playlists', {params: {query: {"filter[owners.id]": ["207473666"]}}});
  return response.data?.data.map(mapTidalPlaylistToPlaylist) ?? [];
}