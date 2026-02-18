import { SpotifyApi } from '@spotify/web-api-ts-sdk';

const SPOTIFY_CLIENT_ID = '2211a17ab92042db90b6e94f3dcb3988';
const SPOTIFY_REDIRECT_URI = 'http://127.0.0.1:5500/spotify/';
export const spotifyApi = SpotifyApi.withUserAuthorization(SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI, ["user-read-private", "user-read-email"]);
