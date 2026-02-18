import { AuthBarrier } from './AuthBarrier';

function App() {
  return <div className='flex flex-col min-h-screen bg-violet-950 text-white py-5'>
    <h1 className='text-center'>Spotify Tidal Importer</h1>
    <div className="flex flex-1 flex-col h-full items-center justify-center">
      <AuthBarrier />
    </div>
  </div>
}

export default App;
