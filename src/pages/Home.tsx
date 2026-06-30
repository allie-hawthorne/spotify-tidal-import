import { useState, type HTMLAttributes, type PropsWithChildren } from "react";
import { AllArtists } from "./EasyImport/AllArtists"
import { AllPlaylists } from "./EasyImport/AllPlaylists"

export const Home = () => {
  const [importPlaylists, setImportPlaylists] = useState(true);
  const [importArtists, setImportArtists] = useState(true);

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
  </div>
}

const ItemWrapper = ({children, ...props}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) => {
  return <div className="flex gap-2 touch-none cursor-pointer" {...props}>
    {children}
  </div>
}