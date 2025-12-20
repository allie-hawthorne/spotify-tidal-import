import { SpotifyApi } from '@spotify/web-api-ts-sdk';

export const SPOTIFY_CLIENT_ID = '2211a17ab92042db90b6e94f3dcb3988';
export const SPOTIFY_REDIRECT_URI = 'http://127.0.0.1:5500/spotify/';
export const spotifySdk = SpotifyApi.withUserAuthorization(SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI, ["user-read-private", "user-read-email"]);

export const TIDAL_API_KEY = 'your_tidal_api_key_here';
export const TIDAL_REDIRECT_URI = 'your_tidal_redirect_uri_here';
