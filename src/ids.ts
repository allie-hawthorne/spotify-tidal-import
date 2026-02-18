import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { createAPIClient } from '@tidal-music/api';
import { credentialsProvider, init, initializeLogin } from '@tidal-music/auth';

const SPOTIFY_CLIENT_ID = '2211a17ab92042db90b6e94f3dcb3988';
const SPOTIFY_REDIRECT_URI = 'http://127.0.0.1:5500/spotify/';
export const spotifyApi = SpotifyApi.withUserAuthorization(SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI, ["user-read-private", "user-read-email"]);

const TIDAL_API_KEY = 'TDiZl2ekSxNNwrYL';
const TIDAL_REDIRECT_URI = 'http://127.0.0.1:5500/tidal/';

const tidalParams = {
    clientId: TIDAL_API_KEY,
    credentialsStorageKey: 'authorisationCode',
    scopes: ['user.read']   
};

export const tidalApi = createAPIClient(credentialsProvider);
export const initialiseTidal = () => init(tidalParams);
export const authenticateTidal = async () => {
    await init(tidalParams)

    // We need these on the static redirect page
    localStorage.setItem('tidalClientId', TIDAL_API_KEY);
    localStorage.setItem('tidalRedirectUri', TIDAL_REDIRECT_URI);

    const loginUrl = await initializeLogin({redirectUri: TIDAL_REDIRECT_URI});

    window.open(loginUrl, '_self');
}

