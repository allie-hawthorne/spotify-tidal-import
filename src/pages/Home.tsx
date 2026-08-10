import { ImportButton } from "../components/buttons/ImportButton";
import { AlbumsImportSection, ArtistsImportSection, PlaylistsImportSection, TracksImportSection } from "./EasyImport/ImportSection";
import { useSpotify } from "../api-helpers/SpotifyContext";
import { useState } from "react";
import { LoadingArea } from "../components/LoadingArea";
import { Toolbar } from "../components/Toolbar";
import { Walkthrough } from "../components/Walkthrough";

export const Home = () => {
  const {isLoading} = useSpotify();
  const [showMore, setShowMore] = useState(false);

  return <div className="flex gap-2 flex-col">
    <Walkthrough />
    {isLoading && !showMore ? <LoadingArea setShowMore={setShowMore} /> : <>
      {/* TODO: Add import from dropdown etc */}
      <Toolbar />
      <PlaylistsImportSection />
      <ArtistsImportSection />
      <AlbumsImportSection />
      <TracksImportSection />
      <ImportButton />
    </>}
  </div>;
}

