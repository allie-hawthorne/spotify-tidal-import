import { Button } from "./Button"

export enum Service {
  Spotify = 'Spotify',
  Tidal = 'Tidal'
}

interface LoginButtonProps {
  service: Service
  onClick: () => void
  iconPath?: string
}
export const LoginButton = ({ iconPath, service, onClick }: LoginButtonProps) => {
  return <div className="flex items-center justify-between bg-gray-800 h-15 p-3 rounded-2xl">
    <div className="flex gap-2 items-center">
      {iconPath && <img src={iconPath} className="w-10" />}
      <p>Connect {service}</p>
    </div>
    <Button onClick={onClick}>Connect</Button>
  </div>
}