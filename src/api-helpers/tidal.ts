import { createAPIClient } from '@tidal-music/api';
import { credentialsProvider, init, initializeLogin } from '@tidal-music/auth';
import type { Playlist } from '../types';
import { keyBy } from 'lodash';


const TIDAL_API_KEY = 'TDiZl2ekSxNNwrYL';
const TIDAL_REDIRECT_URI = 'http://127.0.0.1:5500/tidal/';
// Use this as placeholder image everywhere to ensure consistency
export const TIDAL_PLACEHOLDER_IMAGE_URL = 'https://resources.tidal.com/images/e9448a9a/3ade/4f79/93d2/12e6d8d4b2eb/160x160.jpg'

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

type TidalGETPlaylistsResponse = Awaited<ReturnType<typeof tidalApi.GET<'/playlists', {}>>>
type TidalPlaylistType = NonNullable<TidalGETPlaylistsResponse['data']>['data'][number];
const mapTidalPlaylistToPlaylist = (playlist: TidalPlaylistType, imageUrl: string | undefined): Playlist => ({
  id: playlist.id,
  name: playlist.attributes?.name ?? '',
  description: playlist.attributes?.description ?? '',
  trackCount: playlist.attributes?.numberOfItems ?? 0,
  imageUrl: imageUrl ?? TIDAL_PLACEHOLDER_IMAGE_URL
});

const extractPlaylistArtFromResponse = (response: TidalGETPlaylistsResponse) => {
    const imageUrls = response.data?.included?.map(({id, attributes}) => {
    if (!attributes) return;
    if (!("mediaType" in attributes)) return;
    if (attributes.mediaType !== 'IMAGE') return;
    
    return {
      id,
      url: attributes.files[0].href
    };
  }).filter(x => x !== undefined) ?? [];
  
  return keyBy(imageUrls, url => url?.id);
}

export const getTidalPlaylists = async () => {
  const response = await tidalApi.GET('/playlists', {params: {query: {"filter[owners.id]": ["me"], include: ['coverArt']}}});

  const playlistArt = extractPlaylistArtFromResponse(response)

  return response.data?.data.map((playlist) => {
    const coverArtId = playlist.relationships?.coverArt.data?.[0].id;
    const {url} = coverArtId ? playlistArt[coverArtId] : {};
    return mapTidalPlaylistToPlaylist(playlist, url);
  }) ?? [];
}