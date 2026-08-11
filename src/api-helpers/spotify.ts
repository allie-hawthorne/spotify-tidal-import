import { SpotifyApi } from '@spotify/web-api-ts-sdk';

const SPOTIFY_CLIENT_ID = '2211a17ab92042db90b6e94f3dcb3988';
const SPOTIFY_REDIRECT_URI = `${import.meta.env.VITE_REDIRECT_URL}/spotify/`;
export const spotifyApi = SpotifyApi.withUserAuthorization(SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI, ["user-read-private", "user-read-email", "user-library-read", "user-follow-read", "playlist-read-private", "playlist-read-collaborative"]);

export const authenticateSpotify = () => {
  // We need these on the static redirect page
  localStorage.setItem('spotifyClientId', SPOTIFY_CLIENT_ID);
  localStorage.setItem('redirectUri', import.meta.env.VITE_REDIRECT_URL);

  spotifyApi.authenticate();
}
