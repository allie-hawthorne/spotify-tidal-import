import { useState } from "react";
import { Playlists } from "./Playlists/Playlists";

// Order Matters!
const PageMap = [
  {name: 'Albums', component: null},
  {name: 'Playlists', component: <Playlists />},
] as const

export const Home = () => {
  const [pageIndex, setPageIndex] = useState(1);

  return <div className="flex flex-col gap-2">
    <div className="flex gap-2 justify-center">
      {PageMap.map(({name}, i) => <>
        <button className={`${i === pageIndex && 'text-violet-400'} cursor-pointer`}
          key={i}
          onClick={() => setPageIndex(i)}
        >
          {name}
        </button>
      </>)}
    </div>
    {PageMap[pageIndex].component}
  </div>
}