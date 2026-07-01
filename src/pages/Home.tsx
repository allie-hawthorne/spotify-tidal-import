import { useState, type HTMLAttributes, type PropsWithChildren } from "react";
import { AllArtists } from "./EasyImport/AllArtists"
import { ImportButton } from "../components/ImportButton";
import { useSpotify } from "../api-helpers/SpotifyContext";
import { TidalImporter } from "../api-helpers/classes/TidalImporter";
import { performRateLimitedRequest } from "./Playlists/useImportSpotify";
import { AllAlbums } from "./EasyImport/AllAlbums";
import { AllTracks } from "./EasyImport/AllTracks";
import { AllPlaylists } from "./EasyImport/AllPlaylists";

const symbolRegex = /[`~!@#$£€%^&*()_|+\-=?;:'",.<>{}[\]\\/]/gi;

interface MinArtist {
  id: string,
  name: string,
}

export const Home = () => {
  const {artists} = useSpotify();
  
  const [importAlbums, setImportAlbums] = useState(true);
  const [importArtists, setImportArtists] = useState(true);
  const [importPlaylists, setImportPlaylists] = useState(true);
  const [importTracks, setImportTracks] = useState(true);

  const [successfullyImportedCount, setSuccessfullyImportedCount] = useState(0);
  const [erroredArtists, setErroredArtists] = useState<MinArtist[]>([{id: '', name: 'test'}]);

  const onImportClick = async () => {    
    const tidal = new TidalImporter();
    for (const {name: spotifyName} of artists) {
      const searchResults = await performRateLimitedRequest(() => tidal.searchForArtist(spotifyName));

      // @ts-expect-error - name does exist
      const tidalArtists = searchResults?.map((a): MinArtist => ({id: a?.id ?? '', name: a.attributes?.name as string})) ?? [];

      if (!tidalArtists) {
        console.log("No result on Tidal - Spotify:", spotifyName);
        return;
      }

      const matchedArtist = matchArtistNames(spotifyName, tidalArtists);

      if (!matchedArtist) {
        console.log("No match on Tidal - Spotify:", spotifyName, "Tidal results:", tidalArtists);
        setErroredArtists(prev => [...prev, {id: '', name: spotifyName}]);
        continue;
      }

      const res = await performRateLimitedRequest(() => tidal.addArtist(matchedArtist.id));

      if (!res) {
        console.log("Error adding artist on Tidal - Spotify:", spotifyName, "Tidal:", matchedArtist.name);
        setErroredArtists(prev => [...prev, {id: matchedArtist.id, name: spotifyName}]);
        continue;
      }
      console.log(res);
      setSuccessfullyImportedCount(prev => prev + 1);
    }
  }

  return <div className="flex gap-2 flex-col">
    {/* TODO: Add import from dropdown etc */}
    <ItemWrapper onClick={() => setImportPlaylists(!importPlaylists)}>
      <input type="checkbox" checked={importPlaylists} />
      <AllPlaylists />
    </ItemWrapper>
    <ItemWrapper onClick={() => setImportArtists(!importArtists)}>
      <input type="checkbox" checked={importArtists} />
      <AllArtists successfullyImportedCount={successfullyImportedCount} />
    </ItemWrapper>
    {!!erroredArtists.length && <div className="text-red-500 text-sm">
      <p>{erroredArtists.length} artist(s) not added:</p>
      <ul>{erroredArtists.map(a => <li key={a.id}>{a.name}</li>)}</ul>
    </div>}
    <ItemWrapper onClick={() => setImportAlbums(!importAlbums)}>
      <input type="checkbox" checked={importAlbums} />
      <AllAlbums />
    </ItemWrapper>
    <ItemWrapper onClick={() => setImportTracks(!importTracks)}>
      <input type="checkbox" checked={importTracks} />
      <AllTracks />
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
