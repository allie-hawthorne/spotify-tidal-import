import { authenticateSpotify } from "../../api-helpers/spotify"
import { LoginButton, Service } from "./LoginButton"
import spotifyIcon from '../../assets/spotify-icon.svg'

export const SpotifyLoginButton = () => {
  return <LoginButton
    service={Service.Spotify}
    onClick={authenticateSpotify}
    iconPath={spotifyIcon}
  />
}
