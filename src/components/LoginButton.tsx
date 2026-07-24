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
  return <div className="flex items-center justify-between bg-gray-800 h-15 p-3 rounded-2xl">
    <p>Connect {service}</p>
    <Button onClick={onClick}>Connect</Button>
  </div>
}