import { type ReactNode } from "react";
import { useImporterContext } from "../import-logic/ImportContext";
import { useSpotify } from "../../api-helpers/SpotifyContext";
import { ItemResult } from "./ItemResult";
import { ErrorSection } from "./ErrorSection";

export interface Category {
  key: string;
  name: string;
  total: number;
  succeededCount: number;
  erroredCount: number;
  errorItems: ReactNode;
}

export const ResultsSection = () => {
  const {
    succeededAlbums, erroredAlbums,
    succeededArtists, erroredArtists,
    succeededTracks, erroredTracks,
    succeededPlaylistTracks, erroredPlaylistTracks,
  } = useImporterContext();
  const {playlistData, artistData, albumData, trackData} = useSpotify();

  const erroredPlaylists = Object.entries(erroredPlaylistTracks);
  const succeededPlaylistCount = Object.keys(succeededPlaylistTracks).length;

  const categories: Category[] = [
    {
      key: 'playlists', name: 'Playlists',
      total: playlistData.items.length, succeededCount: succeededPlaylistCount, erroredCount: erroredPlaylists.length,
      errorItems: erroredPlaylists.map(([pId, {playlist, tracks}]) => (
        <li key={pId} className="flex flex-col gap-1">
          <span className="font-medium text-red-300 truncate">{playlist.playlistName}</span>
          <ul className="flex flex-col gap-0.5 min-w-0 pl-3 border-l border-red-500/20 list-none">
            {tracks.map(t => <li className="truncate" key={`${pId}-${t.trackName}-${t.artists}`}>{t.trackName} by {t.artists.join(', ')}</li>)}
          </ul>
        </li>
      )),
    },
    {
      key: 'artists', name: 'Artists',
      total: artistData.items.length, succeededCount: succeededArtists.length, erroredCount: erroredArtists.length,
      errorItems: erroredArtists.map(a => <li key={a.id} className="truncate">{a.artistName}</li>),
    },
    {
      key: 'albums', name: 'Albums',
      total: albumData.items.length, succeededCount: succeededAlbums.length, erroredCount: erroredAlbums.length,
      errorItems: erroredAlbums.map(a => <li key={a.id} className="truncate">{a.albumName} by {a.artists.join(', ')}</li>),
    },
    {
      key: 'tracks', name: 'Tracks',
      total: trackData.items.length, succeededCount: succeededTracks.length, erroredCount: erroredTracks.length,
      errorItems: erroredTracks.map(a => <li key={a.id} className="truncate">{a.trackName} by {a.artists.join(', ')}</li>),
    },
  ];

  const categoriesWithErrors = categories.filter(c => c.erroredCount > 0);

  return <div className="flex flex-col gap-3 min-w-0">
    <div className="flex flex-col gap-2.5 min-w-0">
      {categories.map(c => <ItemResult key={c.key} category={c} />)}
    </div>

    {categoriesWithErrors.length > 0 && <ErrorSection categoriesWithErrors={categoriesWithErrors} />}
  </div>;
};
