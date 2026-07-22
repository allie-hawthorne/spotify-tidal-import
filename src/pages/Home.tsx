import { useState } from "react";
import { ImportButton } from "../components/ImportButton";
import {
  AlbumsImportSection,
  ArtistsImportSection,
  PlaylistsImportSection,
  TracksImportSection,
} from "./EasyImport/ImportSection";
import { useEasyImport } from "./EasyImport/useImport";

export const Home = () => {
  const [importAlbums, setImportAlbums] = useState(true);
  const [importArtists, setImportArtists] = useState(true);
  const [importPlaylists, setImportPlaylists] = useState(true);
  const [importTracks, setImportTracks] = useState(true);

  const {
    onImportClick,
    succeededArtists,
    erroredArtists,
    succeededAlbums,
    erroredAlbums,
    succeededTracks,
    erroredTracks,
    succeededPlaylistTracks,
    erroredPlaylistTracks,
  } = useEasyImport(importTracks, importAlbums, importArtists, importPlaylists);

  return <div className="flex gap-2 flex-col">
    {/* TODO: Add import from dropdown etc */}
    <PlaylistsImportSection
      checked={importPlaylists}
      onToggle={() => setImportPlaylists(!importPlaylists)}
      succeededPlaylistTracks={succeededPlaylistTracks}
      erroredPlaylistTracks={erroredPlaylistTracks}
    />
    <ArtistsImportSection
      checked={importArtists}
      onToggle={() => setImportArtists(!importArtists)}
      succeededArtists={succeededArtists}
      erroredArtists={erroredArtists}
    />
    <AlbumsImportSection
      checked={importAlbums}
      onToggle={() => setImportAlbums(!importAlbums)}
      succeededAlbums={succeededAlbums}
      erroredAlbums={erroredAlbums}
    />
    <TracksImportSection
      checked={importTracks}
      onToggle={() => setImportTracks(!importTracks)}
      succeededTracks={succeededTracks}
      erroredTracks={erroredTracks}
    />
    <ImportButton onClick={onImportClick} />
  </div>
}
