import { useState, type HTMLAttributes, type PropsWithChildren } from "react";
import { AllArtists } from "./EasyImport/AllArtists"
import { ImportButton } from "../components/ImportButton";
import { useSpotify } from "../api-helpers/SpotifyContext";
import { TidalImporter } from "../api-helpers/classes/TidalImporter";
import { performRateLimitedRequest } from "./Playlists/useImportSpotify";

const symbolRegex = /[`~!@#$£€%^&*()_|+\-=?;:'",.<>{}[\]\\/]/gi;

export const Home = () => {
  const {artists} = useSpotify();
  
  const [importAlbums, setImportAlbums] = useState(true);
  const [importArtists, setImportArtists] = useState(true);
  const [importPlaylists, setImportPlaylists] = useState(true);
  const [importTracks, setImportTracks] = useState(true);

  const onImportClick = async () => {    
    for (const {name: spotifyName} of artists) {
      const searchResults = await performRateLimitedRequest(() => new TidalImporter().searchForArtist(spotifyName));

      // @ts-expect-error - name does exist
      const tidalArtists = searchResults?.map(a => ({id: a?.id ?? '', name: a.attributes?.name as string})) ?? [];

      if (!tidalArtists) {
        console.log("No result on Tidal - Spotify:", spotifyName);
        return;
      }

      const matchedArtist = matchArtistNames(spotifyName, tidalArtists);
      console.log("Spotify:", spotifyName, "Tidal:", matchedArtist?.name ?? "No match");
    }
  }

  return <div className="flex gap-2 flex-col">
    {/* TODO: Add import from dropdown etc */}
    <ItemWrapper onClick={() => setImportPlaylists(!importPlaylists)}>
      <input type="checkbox" checked={importPlaylists} />
      {/* <AllPlaylists /> */}
    </ItemWrapper>
    <ItemWrapper onClick={() => setImportArtists(!importArtists)}>
      <input type="checkbox" checked={importArtists} />
      <AllArtists />
    </ItemWrapper>
    <ItemWrapper onClick={() => setImportAlbums(!importAlbums)}>
      <input type="checkbox" checked={importAlbums} />
      {/* <AllAlbums /> */}
    </ItemWrapper>
    <ItemWrapper onClick={() => setImportTracks(!importTracks)}>
      <input type="checkbox" checked={importTracks} />
      {/* <AllTracks /> */}
    </ItemWrapper>
    <ImportButton onClick={onImportClick} />
  </div>
}

const ItemWrapper = ({children, ...props}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) => {
  return <div className="flex gap-2 touch-none cursor-pointer" {...props}>
    {children}
  </div>
}

// TODO: can probably improve but the array length is like 10 max, and it early returns
// we're doing three loops because we want to prioritise matching names rather than array index
const matchArtistNames = (spotifyName: string, tidalArtists: {id: string, name: string}[]) => {
  for (const tidalArtist of tidalArtists) {
    const tidalName = tidalArtist.name;
    if (spotifyName === tidalName) return tidalArtist;
  }
  for (const tidalArtist of tidalArtists) {
    const tidalName = tidalArtist.name.toLocaleUpperCase();
    if (spotifyName.toLocaleUpperCase() === tidalName) return tidalArtist;
  }
    for (const tidalArtist of tidalArtists) {
    const tidalName = tidalArtist.name.toLocaleUpperCase().replace(symbolRegex, '');
    if (spotifyName.toLocaleUpperCase().replace(symbolRegex, '') === tidalName) return tidalArtist;
  }

}
