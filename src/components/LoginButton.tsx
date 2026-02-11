export enum Service {
  Spotify = 'Spotify',
  Tidal = 'Tidal'
}

interface LoginButtonProps {
  service: Service
  onClick: () => void
}
export const LoginButton = ({ service, onClick }: LoginButtonProps) => {
  return <button className="bg-blue-500 rounded-2xl cursor-pointer p-1" onClick={onClick}>
    Log in with {service}
  </button>
}