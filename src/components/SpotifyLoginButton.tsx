import { spotifyApi } from "../ids"
import { LoginButton, Service } from "./LoginButton"

export const SpotifyLoginButton = () => {
  return <LoginButton
    service={Service.Spotify}
    onClick={() => spotifyApi.authenticate()}
  />
}
