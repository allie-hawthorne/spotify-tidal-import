import { type MouseEvent } from "react";
import { ImportSummary } from "./ImportSummary";
import { useImporterContext, type UseState } from "./ImportContext";
import { useSpotify, type Resource } from "../../api-helpers/SpotifyContext";
import { Checkbox } from "../../components/Checkbox";
import { Spinner } from "../../components/Spinner";

type ImportSectionProps = {
  resource: Resource<unknown>;
  preLabel?: string;
  label: string;
  succeededCount: number;
  checked: boolean;
  setShouldImport: UseState<boolean>;
};

export const ImportSection = ({ resource, preLabel, label, succeededCount, checked, setShouldImport }: ImportSectionProps) => {
  const {loading} = resource;

  const toggle = (e: MouseEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setShouldImport(s => !s);
  }

  return <label className="flex gap-2 items-center touch-none cursor-pointer" onClick={loading ? undefined : toggle}>
    {loading ? <Spinner /> : <Checkbox checked={checked} />}
    <ImportSummary resource={resource} preLabel={preLabel} label={label} succeededCount={succeededCount} />
  </label>;
};

export const PlaylistsImportSection = () => {
  const {succeededPlaylistTracks, shouldImportPlaylists, setShouldImportPlaylists} = useImporterContext();
  const {playlistData, totalPlaylistTracks} = useSpotify();

  const succeededPlaylistCount = Object.entries(succeededPlaylistTracks).length;

  return <ImportSection
    resource={playlistData}
    label='playlists'
    preLabel={totalPlaylistTracks ? `${totalPlaylistTracks} tracks from` : undefined}
    succeededCount={succeededPlaylistCount}
    checked={shouldImportPlaylists}
    setShouldImport={setShouldImportPlaylists}
  />;
};

export const ArtistsImportSection = () => {
  const {succeededArtists, shouldImportArtists, setShouldImportArtists} = useImporterContext();
  const {artistData} = useSpotify();

  return <ImportSection
    resource={artistData}
    label="followed artists"
    succeededCount={succeededArtists.length}
    checked={shouldImportArtists}
    setShouldImport={setShouldImportArtists}
  />;
};

export const AlbumsImportSection = () => {
  const {succeededAlbums, shouldImportAlbums, setShouldImportAlbums} = useImporterContext();
  const {albumData} = useSpotify();

  return <ImportSection
    resource={albumData}
    label="saved albums"
    succeededCount={succeededAlbums.length}
    checked={shouldImportAlbums}
    setShouldImport={setShouldImportAlbums}
  />;
};

export const TracksImportSection = () => {
  const {succeededTracks, shouldImportTracks, setShouldImportTracks} = useImporterContext();
  const {trackData} = useSpotify();

  return <ImportSection
    resource={trackData}
    label="followed tracks"
    succeededCount={succeededTracks.length}
    checked={shouldImportTracks}
    setShouldImport={setShouldImportTracks}
  />;
};
