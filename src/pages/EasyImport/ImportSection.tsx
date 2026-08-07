import type { PropsWithChildren } from "react";
import { ImportSummary } from "./ImportSummary";
import { useImporterContext, type UseState } from "./ImportContext";
import { PlaylistState, useSpotify, type Resource } from "../../api-helpers/SpotifyContext";

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

  return <div className="flex flex-col gap-2">
    <div className="flex gap-2 touch-none cursor-pointer" onClick={() => loading ? undefined : setShouldImport(s => !s)}>
      <input type="checkbox" checked={loading ? false : checked} disabled={loading} readOnly className="pointer-events-none" />
      <ImportSummary resource={resource} preLabel={preLabel} label={label} succeededCount={succeededCount} />
    </div>
    {children}
  </div>;
};

type ImportErrorListProps = PropsWithChildren<{
  count: number;
  title: string;
}>;

export const ImportErrorList = ({ count, title, children }: ImportErrorListProps) => {
  if (!count) {
    return null;
  }

  return <div className="text-red-500 text-sm">
    <p>{count} {title}</p>
    <ul>{children}</ul>
  </div>;
};

export const PlaylistsImportSection = () => {
  const {
    succeededPlaylistTracks,
    erroredPlaylistTracks,
    shouldImportPlaylists,
    setShouldImportPlaylists
  } = useImporterContext();
  const {playlistData, playlistState} = useSpotify();

  const erroredPlaylists = Object.entries(erroredPlaylistTracks);
  const succeededPlaylistCount = Object.entries(succeededPlaylistTracks).length;
  const trackCount = playlistData.items.reduce((sum, p) => sum + p.tracks.length, 0);
  const isTracksStage = playlistState === PlaylistState.Tracks;

  return <ImportSection
    resource={playlistData}
    label='playlists'
    preLabel={isTracksStage ? `${trackCount} tracks from` : undefined}
    succeededCount={succeededPlaylistCount}
    checked={shouldImportPlaylists}
    setShouldImport={setShouldImportPlaylists}
  >
    <ImportErrorList count={erroredPlaylists.length} title="playlist(s) not added:">
      {erroredPlaylists.map(([pId, {tracks}]) => (
        <li key={pId}>
          <span>{pId}</span>
          {tracks.map(t => <div className="ml-2" key={`${pId}-${t.trackName}-${t.artists}`}>{t.trackName} by {t.artists}</div>)}
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
    <ImportErrorList count={erroredArtists.length} title="artist(s) not added:">
      {erroredArtists.map(a => <li key={a.id}>{a.artistName}</li>)}
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
    <ImportErrorList count={erroredAlbums.length} title="album(s) not added:">
      {erroredAlbums.map(a => <li key={a.id}>{a.albumName} by {a.artists}</li>)}
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
    <ImportErrorList count={erroredTracks.length} title="track(s) not added:">
      {erroredTracks.map(a => <li key={a.id}>{a.trackName} by {a.artists}</li>)}
    </ImportErrorList>
  </ImportSection>;
};
