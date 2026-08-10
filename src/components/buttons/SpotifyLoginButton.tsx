import { spotifyApi } from "../../api-helpers/spotify"
import { LoginButton, Service } from "./LoginButton"
import spotifyIcon from '../../assets/spotify-icon.svg'

export const SpotifyLoginButton = () => {
  return <LoginButton
    service={Service.Spotify}
    onClick={() => spotifyApi.authenticate()}
    iconPath={spotifyIcon}
  />
}
