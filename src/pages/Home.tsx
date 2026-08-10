import { ImportButton } from "../components/buttons/ImportButton";
import { AlbumsImportSection, ArtistsImportSection, PlaylistsImportSection, TracksImportSection } from "./ImportSection";
import { ResultsSection } from "./results/ResultsSection";
import { useSpotify } from "../api-helpers/SpotifyContext";
import { useState } from "react";
import { LoadingArea } from "../components/LoadingArea";
import { Toolbar } from "../components/Toolbar";
import { useWalkthroughStep, WalkthroughSteps } from "./walkthrough/useWalkthroughStep";

export const Home = () => {
  const {isLoading} = useSpotify();
  const [showMore, setShowMore] = useState(false);
  const step = useWalkthroughStep();
  // Selection is locked in once import has started - show live results instead of checkboxes.
  const hasStartedImporting = step !== WalkthroughSteps.Sync && step !== WalkthroughSteps.Select;

  if (isLoading && !showMore) return <LoadingArea setShowMore={setShowMore} />;
  
  return <div className="flex gap-2 flex-col">
    {/* TODO: Add import from dropdown etc */}
    <Toolbar />
    {hasStartedImporting ? <ResultsSection /> : <ImportOptions />}
    <ImportButton />
  </div>;
}

const ImportOptions = () => {
  return <>
    <PlaylistsImportSection />
    <ArtistsImportSection />
    <AlbumsImportSection />
    <TracksImportSection />
  </>;
}