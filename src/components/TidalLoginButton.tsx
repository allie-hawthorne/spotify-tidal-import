import { authenticateTidal } from "../ids"
import { LoginButton, Service } from "./LoginButton"

export const TidalLoginButton = () => {
  return <LoginButton
    service={Service.Tidal}
    onClick={authenticateTidal}
  />
}
