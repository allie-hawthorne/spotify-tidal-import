import { spotifySdk } from './ids'

function App() {
  return <div>
    <h1>Spotify Tidal Importer</h1>
    <button
      onClick={() => spotifySdk.authenticate().then(console.log)}
    >
      Click me
    </button>
  </div>
}

export default App
