import { spotifyApi } from "../api-helpers/spotify"
import { LoginButton, Service } from "./LoginButton"

export const SpotifyLoginButton = () => {
  return <LoginButton
    service={Service.Spotify}
    onClick={() => spotifyApi.authenticate()}
  />
}
