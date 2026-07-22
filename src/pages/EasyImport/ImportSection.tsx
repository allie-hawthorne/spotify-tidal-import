import type { PropsWithChildren, ReactNode } from "react";
import { AllAlbums } from "./AllAlbums";
import { AllArtists } from "./AllArtists";
import { AllPlaylists } from "./AllPlaylists";
import { AllTracks } from "./AllTracks";
import type { MinArtist } from "./useImport";
import type { MinAlbum } from "./useImportAlbums";
import type { PlaylistTracksMap } from "./useImportPlaylists";
import type { MinTrack } from "./useImportTracks";

type ImportSectionProps = PropsWithChildren<{
  checked: boolean;
  onToggle: () => void;
  summary: ReactNode;
}>;

export const ImportSection = ({ checked, onToggle, summary, children }: ImportSectionProps) => {
  return <div className="flex flex-col gap-2">
    <div className="flex gap-2 touch-none cursor-pointer" onClick={onToggle}>
      <input type="checkbox" checked={checked} readOnly className="pointer-events-none" />
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

type PlaylistImportSectionProps = {
  checked: boolean;
  onToggle: () => void;
  succeededPlaylistTracks: PlaylistTracksMap;
  erroredPlaylistTracks: PlaylistTracksMap;
};

export const PlaylistsImportSection = ({ checked, onToggle, succeededPlaylistTracks, erroredPlaylistTracks }: PlaylistImportSectionProps) => {
  const erroredPlaylists = Object.entries(erroredPlaylistTracks);

  return <ImportSection
    checked={checked}
    onToggle={onToggle}
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

type ArtistImportSectionProps = {
  checked: boolean;
  onToggle: () => void;
  succeededArtists: MinArtist[];
  erroredArtists: MinArtist[];
};

export const ArtistsImportSection = ({ checked, onToggle, succeededArtists, erroredArtists }: ArtistImportSectionProps) => {
  return <ImportSection
    checked={checked}
    onToggle={onToggle}
    summary={<AllArtists succeededArtists={succeededArtists} />}
  >
    <ImportErrorList count={erroredArtists.length} title="artist(s) not added:">
      {erroredArtists.map(a => <li key={a.id}>{a.artistName}</li>)}
    </ImportErrorList>
  </ImportSection>;
};

type AlbumImportSectionProps = {
  checked: boolean;
  onToggle: () => void;
  succeededAlbums: MinAlbum[];
  erroredAlbums: MinAlbum[];
};

export const AlbumsImportSection = ({ checked, onToggle, succeededAlbums, erroredAlbums }: AlbumImportSectionProps) => {
  return <ImportSection
    checked={checked}
    onToggle={onToggle}
    summary={<AllAlbums succeededAlbums={succeededAlbums} />}
  >
    <ImportErrorList count={erroredAlbums.length} title="album(s) not added:">
      {erroredAlbums.map(a => <li key={a.id}>{a.albumName} by {a.artistName}</li>)}
    </ImportErrorList>
  </ImportSection>;
};

type TrackImportSectionProps = {
  checked: boolean;
  onToggle: () => void;
  succeededTracks: MinTrack[];
  erroredTracks: MinTrack[];
};

export const TracksImportSection = ({ checked, onToggle, succeededTracks, erroredTracks }: TrackImportSectionProps) => {
  return <ImportSection
    checked={checked}
    onToggle={onToggle}
    summary={<AllTracks succeededTracks={succeededTracks} />}
  >
    <ImportErrorList count={erroredTracks.length} title="track(s) not added:">
      {erroredTracks.map(a => <li key={a.id}>{a.trackName} by {a.artistName}</li>)}
    </ImportErrorList>
  </ImportSection>;
};
