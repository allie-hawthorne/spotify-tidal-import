import { ImportButton } from "../components/ImportButton";
import { AlbumsImportSection, ArtistsImportSection, PlaylistsImportSection, TracksImportSection } from "./EasyImport/ImportSection";
import { useImporterContext } from "./EasyImport/ImportContext";
import { useSpotify } from "../api-helpers/SpotifyContext";
import { useState } from "react";
import { PieChart } from "react-minimal-pie-chart";
import { Button } from "../components/Button";

export const Home = () => {
  const {onImportClick} = useImporterContext();
  const {isLoading} = useSpotify();
  const [showMore, setShowMore] = useState(false);
  
  if (isLoading && !showMore) return <LoadingArea setShowMore={setShowMore} />;
  
  return <div className="flex gap-2 flex-col">
    {/* TODO: Add import from dropdown etc */}
    <div className="flex justify-end">
      <Button disabled={isLoading} onClick={() => console.log('clicked')}>Export</Button>
    </div>
    <PlaylistsImportSection />
    <ArtistsImportSection />
    <AlbumsImportSection />
    <TracksImportSection />
    <ImportButton onClick={onImportClick} />
  </div>;
}

const LoadingArea = ({setShowMore}: {setShowMore: (v: boolean) => void}) => {
  const {overallProgress, overallTotal, haveTotalsReturned} = useSpotify();

  return <div className="flex flex-col items-center h-32">
    <p>Loading your Spotify data...</p>
    <a className="text-gray-400" href="#" onClick={() => setShowMore(true)}>Show More Info</a>
    {/* <p className="text-gray-300">this may take a while</p> */}
    {haveTotalsReturned && <PieChart className="h-full mt-3"
      startAngle={-90}
      lineWidth={25}
      animate
      data={[
        {color: '#99a1af', value: overallProgress},
        {color: '#e5e7eb', value: overallTotal-overallProgress},
      ]}
    />}
  </div>;
}