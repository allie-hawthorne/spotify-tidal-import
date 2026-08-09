import { ImportButton } from "../components/ImportButton";
import { AlbumsImportSection, ArtistsImportSection, PlaylistsImportSection, TracksImportSection } from "./EasyImport/ImportSection";
import { useSpotify } from "../api-helpers/SpotifyContext";
import { useState } from "react";
import { LoadingArea } from "../components/LoadingArea";
import { ExportButton } from "../components/ExportButton";
import { SyncStatus } from "../components/SyncStatus";

export const Home = () => {
  const {isLoading} = useSpotify();
  const [showMore, setShowMore] = useState(false);

  if (isLoading && !showMore) return <LoadingArea setShowMore={setShowMore} />;

  return <div className="flex gap-2 flex-col">
    {/* TODO: Add import from dropdown etc */}
    <div className="flex justify-end items-center gap-2 text-gray-400 text-sm">
      <SyncStatus />
      <ExportButton />
    </div>
    <PlaylistsImportSection />
    <ArtistsImportSection />
    <AlbumsImportSection />
    <TracksImportSection />
    <ImportButton />
  </div>;
}

