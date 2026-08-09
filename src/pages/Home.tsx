import { ImportButton } from "../components/ImportButton";
import { AlbumsImportSection, ArtistsImportSection, PlaylistsImportSection, TracksImportSection } from "./EasyImport/ImportSection";
import { useSpotify } from "../api-helpers/SpotifyContext";
import { useState } from "react";
import { LoadingArea } from "../components/LoadingArea";
import { ExportButton } from "../components/ExportButton";
import { SyncStatus } from "../components/SyncStatus";

export const Home = () => {
  const {isLoading, syncedAt, refresh} = useSpotify();
  const [showMore, setShowMore] = useState(false);

  if (isLoading && !showMore) return <LoadingArea setShowMore={setShowMore} />;

  return <div className="flex gap-2 flex-col">
    {/* TODO: Add import from dropdown etc */}
    <div className="flex justify-between items-center">
      <SyncStatus syncedAt={syncedAt} isSyncing={isLoading} onRefresh={refresh} />
      <ExportButton />
    </div>
    <PlaylistsImportSection />
    <ArtistsImportSection />
    <AlbumsImportSection />
    <TracksImportSection />
    <ImportButton />
  </div>;
}

