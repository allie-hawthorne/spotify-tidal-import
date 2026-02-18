import { createAPIClient } from '@tidal-music/api';
import { credentialsProvider, init, initializeLogin } from '@tidal-music/auth';

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
