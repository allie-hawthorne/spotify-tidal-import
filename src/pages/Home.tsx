import { AllArtists } from "./EasyImport/AllArtists"
import { AllPlaylists } from "./EasyImport/AllPlaylists"

// Order Matters!
// const PageMap = [
//   {name: 'Playlists', component: <Playlists />},
//   {name: 'Albums', component: null},
// ] as const

export const Home = () => {
  return <div className="flex flex-col gap-2">
    <div className="flex gap-2 justify-center">
      {/* TODO: Add import from dropdown etc */}
      <div>
        <AllPlaylists />
        <AllArtists />
      </div>
      {/* {PageMap.map(({name}, i) => <>
        <button className={`${i === pageIndex && 'text-violet-400'} cursor-pointer`}
          key={i}
          onClick={() => setPageIndex(i)}
        >
          {name}
        </button>
      </>)} */}
    </div>
    {/* {PageMap[pageIndex].component} */}
  </div>
}