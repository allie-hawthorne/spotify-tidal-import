import { spotifySdk } from "../ids"

export const SpotityLoginButton = () => {
  return <button
    onClick={() => spotifySdk.authenticate().then(console.log)}
  >
    Click me
  </button>
}