import { useState, type MouseEvent, type PropsWithChildren } from "react";
import AlertCircleOutlineIcon from "mdi-react/AlertCircleOutlineIcon";
import PlusIcon from "mdi-react/PlusIcon";
import MinusIcon from "mdi-react/MinusIcon";
import { ImportSummary } from "./ImportSummary";
import { useImporterContext, type UseState } from "./ImportContext";
import { useSpotify, type Resource } from "../../api-helpers/SpotifyContext";
import { Checkbox } from "../../components/Checkbox";
import { Spinner } from "../../components/Spinner";

const pluralize = (word: string, count: number) => {
  if (count === 1) return word;
  return `${word}s`;
};

type ImportSectionProps = PropsWithChildren<{
  resource: Resource<unknown>;
  preLabel?: string;
  label: string;
  succeededCount: number;
  checked: boolean;
  setShouldImport: UseState<boolean>;
}>;

export const ImportSection = ({ resource, preLabel, label, succeededCount, checked, setShouldImport, children }: ImportSectionProps) => {
  const {loading} = resource;

  const toggle = (e: MouseEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setShouldImport(s => !s);
  }
  
  return <div className="flex flex-col gap-2">
    <label className="flex gap-2 items-center touch-none cursor-pointer" onClick={loading ? undefined : toggle}>
      {loading ? <Spinner /> : <Checkbox checked={checked} />}
      <ImportSummary resource={resource} preLabel={preLabel} label={label} succeededCount={succeededCount} />
    </label>
    {children}
  </div>;
};

type ImportErrorListProps = PropsWithChildren<{
  count: number;
  label: string;
}>;

export const ImportErrorList = ({ count, label, children }: ImportErrorListProps) => {
  const [open, setOpen] = useState(false);
  const toggle = (e: MouseEvent) => {
    e.preventDefault();
    setOpen(s => !s);
  };

  if (!count) return null;

  return <details className="flex flex-col bg-red-500/5 border border-red-500/20 rounded-xl px-3" open={open}>
    <summary className="flex justify-between py-3 text-sm font-medium text-red-400 cursor-pointer" onClick={toggle}>
      <div className="flex items-center gap-1.5"><AlertCircleOutlineIcon /> {count} {pluralize(label, count)} not added</div>
      {open ? <MinusIcon /> : <PlusIcon />}
    </summary>
    <ul className="flex flex-col gap-1.5 max-h-48 overflow-y-auto text-sm text-red-300/80 list-none">
      {children}
    </ul>
  </details>;
};

export const PlaylistsImportSection = () => {
  const {
    succeededPlaylistTracks,
    erroredPlaylistTracks,
    shouldImportPlaylists,
    setShouldImportPlaylists
  } = useImporterContext();
  const {playlistData, totalPlaylistTracks} = useSpotify();

  const erroredPlaylists = Object.entries(erroredPlaylistTracks);
  const succeededPlaylistCount = Object.entries(succeededPlaylistTracks).length;

  return <ImportSection
    resource={playlistData}
    label='playlists'
    preLabel={totalPlaylistTracks ? `${totalPlaylistTracks} tracks from` : undefined}
    succeededCount={succeededPlaylistCount}
    checked={shouldImportPlaylists}
    setShouldImport={setShouldImportPlaylists}
  >
    <ImportErrorList count={erroredPlaylists.length} label="playlist">
      {erroredPlaylists.map(([pId, {playlist, tracks}]) => (
        <li key={pId} className="flex flex-col gap-1">
          <span className="font-medium text-red-300 truncate">{playlist.playlistName}</span>
          <ul className="flex flex-col gap-0.5 pl-3 border-l border-red-500/20 list-none">
            {tracks.map(t => <li className="truncate" key={`${pId}-${t.trackName}-${t.artists}`}>{t.trackName} by {t.artists.join(', ')}</li>)}
          </ul>
        </li>
      ))}
    </ImportErrorList>
  </ImportSection>;
};

export const ArtistsImportSection = () => {
  const {
    succeededArtists,
    erroredArtists,
    shouldImportArtists,
    setShouldImportArtists
  } = useImporterContext();
  const {artistData} = useSpotify();

  return <ImportSection
    resource={artistData}
    label="followed artists"
    succeededCount={succeededArtists.length}
    checked={shouldImportArtists}
    setShouldImport={setShouldImportArtists}
  >
    <ImportErrorList count={erroredArtists.length} label="artist">
      {erroredArtists.map(a => <li key={a.id} className="truncate">{a.artistName}</li>)}
    </ImportErrorList>
  </ImportSection>;
};

export const AlbumsImportSection = () => {
  const {
    succeededAlbums,
    erroredAlbums,
    shouldImportAlbums,
    setShouldImportAlbums
  } = useImporterContext();
  const {albumData} = useSpotify();

  return <ImportSection
    resource={albumData}
    label="saved albums"
    succeededCount={succeededAlbums.length}
    checked={shouldImportAlbums}
    setShouldImport={setShouldImportAlbums}
  >
    <ImportErrorList count={erroredAlbums.length} label="album">
      {erroredAlbums.map(a => <li key={a.id} className="truncate">{a.albumName} by {a.artists.join(', ')}</li>)}
    </ImportErrorList>
  </ImportSection>;
};

export const TracksImportSection = () => {
  const {
    succeededTracks,
    erroredTracks,
    shouldImportTracks,
    setShouldImportTracks
  } = useImporterContext();
  const {trackData} = useSpotify();

  return <ImportSection
    resource={trackData}
    label="followed tracks"
    succeededCount={succeededTracks.length}
    checked={shouldImportTracks}
    setShouldImport={setShouldImportTracks}
  >
    <ImportErrorList count={erroredTracks.length} label="track">
      {erroredTracks.map(a => <li key={a.id} className="truncate">{a.trackName} by {a.artists.join(', ')}</li>)}
    </ImportErrorList>
  </ImportSection>;
};
