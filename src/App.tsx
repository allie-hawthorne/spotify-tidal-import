import { AuthBarrier } from './AuthBarrier';

function App() {
  return <div className='flex flex-col min-h-screen text-purple-100 p-5 font-roboto' style={{ background: 'radial-gradient(120% 100% at 50% 0%, rgb(19, 20, 35) 0%, rgb(5, 7, 13) 55%, rgb(2, 3, 6) 100%)' }}>
    <div className="flex flex-1 flex-col h-full items-center justify-center">
      <div className='flex flex-col bg-purple-100/5 border border-purple-300/20 max-w-md w-full p-10 rounded-3xl gap-2'>
        <AuthBarrier />
      </div>
    </div>
  </div>
}

export default App;
