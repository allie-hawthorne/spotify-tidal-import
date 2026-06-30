import { useState, type HTMLAttributes, type PropsWithChildren } from "react";
import { AllArtists } from "./EasyImport/AllArtists"
import { AllPlaylists } from "./EasyImport/AllPlaylists"
import { AllAlbums } from "./EasyImport/AllAlbums";
import { AllTracks } from "./EasyImport/AllTracks";

export const Home = () => {
  const [importAlbums, setImportAlbums] = useState(true);
  const [importArtists, setImportArtists] = useState(true);
  const [importPlaylists, setImportPlaylists] = useState(true);
  const [importTracks, setImportTracks] = useState(true);

  return <div className="flex gap-2 flex-col">
    {/* TODO: Add import from dropdown etc */}
    <ItemWrapper onClick={() => setImportPlaylists(!importPlaylists)}>
      <input type="checkbox" checked={importPlaylists} />
      <AllPlaylists />
    </ItemWrapper>
    <ItemWrapper onClick={() => setImportArtists(!importArtists)}>
      <input type="checkbox" checked={importArtists} />
      <AllArtists />
    </ItemWrapper>
    <ItemWrapper onClick={() => setImportAlbums(!importAlbums)}>
      <input type="checkbox" checked={importAlbums} />
      <AllAlbums />
    </ItemWrapper>
    <ItemWrapper onClick={() => setImportTracks(!importTracks)}>
      <input type="checkbox" checked={importTracks} />
      <AllTracks />
    </ItemWrapper>
  </div>
}

const ItemWrapper = ({children, ...props}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) => {
  return <div className="flex gap-2 touch-none cursor-pointer" {...props}>
    {children}
  </div>
}