import type { PropsWithChildren, ReactNode } from "react";
import { AllAlbums } from "./AllAlbums";
import { AllArtists } from "./AllArtists";
import { AllPlaylists } from "./AllPlaylists";
import { AllTracks } from "./AllTracks";
import { useImporterContext, type UseState } from "./ImportContext";
import { useSpotify } from "../../api-helpers/SpotifyContext";

type ImportSectionProps = PropsWithChildren<{
  loading: boolean;
  checked: boolean;
  setShouldImport: UseState<boolean>;
  summary: ReactNode;
}>;

export const ImportSection = ({ loading, checked, setShouldImport, summary, children }: ImportSectionProps) => {
  return <div className="flex flex-col gap-2">
    <div className="flex gap-2 touch-none cursor-pointer" onClick={() => loading ? undefined : setShouldImport(s => !s)}>
      <input type="checkbox" checked={loading ? false : checked} disabled={loading} readOnly className="pointer-events-none" />
      {summary}
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
  const {playlistsLoading} = useSpotify();

  const erroredPlaylists = Object.entries(erroredPlaylistTracks);

  return <ImportSection
    loading={playlistsLoading}
    checked={shouldImportPlaylists}
    setShouldImport={setShouldImportPlaylists}
    summary={<AllPlaylists succeededPlaylistTracks={succeededPlaylistTracks} />}
  >
    <ImportErrorList count={erroredPlaylists.length} title="playlist(s) not added:">
      {erroredPlaylists.map(([pId, {tracks}]) => (
        <li key={pId}>
          <span>{pId}</span>
          {tracks.map(t => <div className="ml-2" key={`${pId}-${t.trackName}-${t.artistName}`}>{t.trackName} by {t.artistName}</div>)}
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
  const {artistsLoading} = useSpotify();

  return <ImportSection
    loading={artistsLoading}
    checked={shouldImportArtists}
    setShouldImport={setShouldImportArtists}
    summary={<AllArtists succeededArtists={succeededArtists} />}
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
  const {albumsLoading} = useSpotify();

  return <ImportSection
    loading={albumsLoading}
    checked={shouldImportAlbums}
    setShouldImport={setShouldImportAlbums}
    summary={<AllAlbums succeededAlbums={succeededAlbums} />}
  >
    <ImportErrorList count={erroredAlbums.length} title="album(s) not added:">
      {erroredAlbums.map(a => <li key={a.id}>{a.albumName} by {a.artistName}</li>)}
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
  const {tracksLoading} = useSpotify();

  return <ImportSection
    loading={tracksLoading}
    checked={shouldImportTracks}
    setShouldImport={setShouldImportTracks}
    summary={<AllTracks succeededTracks={succeededTracks} />}
  >
    <ImportErrorList count={erroredTracks.length} title="track(s) not added:">
      {erroredTracks.map(a => <li key={a.id}>{a.trackName} by {a.artistName}</li>)}
    </ImportErrorList>
  </ImportSection>;
};
