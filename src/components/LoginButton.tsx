import { Button } from "./Button"

export enum Service {
  Spotify = 'Spotify',
  Tidal = 'Tidal'
}

interface LoginButtonProps {
  service: Service
  onClick: () => void
}
export const LoginButton = ({ service, onClick }: LoginButtonProps) => {
  return <Button onClick={onClick}>
    Log in with {service}
  </Button>
}