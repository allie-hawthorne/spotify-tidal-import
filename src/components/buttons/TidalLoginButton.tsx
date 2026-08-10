import { authenticateTidal } from "../../api-helpers/tidal"
import { LoginButton, Service } from "./LoginButton"
import tidalIcon from '../../assets/tidal-icon.svg'

export const TidalLoginButton = () => {
  return <LoginButton
    service={Service.Tidal}
    onClick={authenticateTidal}
    iconPath={tidalIcon}
  />
}
