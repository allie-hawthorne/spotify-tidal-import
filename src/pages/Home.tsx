import { ImportButton } from "../components/ImportButton";
import { AlbumsImportSection, ArtistsImportSection, PlaylistsImportSection, TracksImportSection } from "./EasyImport/ImportSection";
import { useImporterContext } from "./EasyImport/ImportContext";
import { useSpotify } from "../api-helpers/SpotifyContext";
import { useState } from "react";

export const Home = () => {
  const {onImportClick} = useImporterContext();
  const {isLoading} = useSpotify();
  const [showMore, setShowMore] = useState(false);
  
  if (isLoading && !showMore) return <LoadingArea setShowMore={setShowMore} />;
  
  return <div className="flex gap-2 flex-col">
    {/* TODO: Add import from dropdown etc */}
    <PlaylistsImportSection />
    <ArtistsImportSection />
    <AlbumsImportSection />
    <TracksImportSection />
    <ImportButton onClick={onImportClick} />
  </div>;
}

const LoadingArea = ({setShowMore}: {setShowMore: (v: boolean) => void}) => {
  const {overallProgress, overallTotal, haveTotalsReturned} = useSpotify();

  return <div className="flex flex-col items-center">
    <p>Loading your Spotify data!</p>
    {haveTotalsReturned && <div className="h-3 w-20 bg-gray-400 rounded">
      <div className="h-full bg-gray-200 rounded" style={{width: `${(overallProgress/overallTotal)*100}%`}} />
    </div>}
    <a className="text-gray-400" href="#" onClick={() => setShowMore(true)}>Show More Info</a>
  </div>;
}