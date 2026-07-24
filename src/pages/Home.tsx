import { ImportButton } from "../components/ImportButton";
import { AlbumsImportSection, ArtistsImportSection, PlaylistsImportSection, TracksImportSection } from "./EasyImport/ImportSection";
import { useImporterContext } from "./EasyImport/ImportContext";

export const Home = () => {
  const {onImportClick} = useImporterContext();

  return <div className="flex gap-2 flex-col">
    {/* TODO: Add import from dropdown etc */}
    <PlaylistsImportSection/>
    <ArtistsImportSection/>
    <AlbumsImportSection/>
    <TracksImportSection/>
    <ImportButton onClick={onImportClick} />
  </div>

}
