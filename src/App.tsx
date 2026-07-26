import { AuthBarrier } from './AuthBarrier';

function App() {
  return <div className='flex flex-col min-h-screen bg-gray-950 text-white p-5'>
    <div className="flex flex-1 flex-col h-full items-center justify-center">
      <div className='flex flex-col max-w-md gap-2'>
        <h1 className='text-2xl'>Spotifree</h1>
        <AuthBarrier />
      </div>
    </div>
  </div>
}

export default App;
