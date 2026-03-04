import type { Playlist, PlaylistWithItems } from "./Playlists";

interface PlaylistImportStatusProps {
  selectedPlaylists: Playlist[];
  allPlaylists: PlaylistWithItems[];
}
export const PlaylistImportStatus = ({ selectedPlaylists, allPlaylists }: PlaylistImportStatusProps) => {
  return <>
    <p>Imported Playlists:</p>
    <div className="grid grid-cols-2">
      {selectedPlaylists.map((p, i) => {
        const thisPlaylistTracks = allPlaylists.find(pl => pl.id === p.id);

        return <div key={i} className="border p-2">
        <p>Playlist: {p.name}</p>
        {thisPlaylistTracks
          // TODO: new component here
          ? <div>
              <p>Tracks:</p>
              <ul>
                {thisPlaylistTracks.items.map((item, index) => (
                  <li key={index}>{item.title} by {item.artists.join(', ')}</li>
                ))}
              </ul>
          </div>
          : <p>Loading tracks...</p>
        }
        <p>{p.name}: {thisPlaylistTracks?.items[0] ? `${thisPlaylistTracks.items[0].title} by ${thisPlaylistTracks.items[0].artists.join(', ')}` : 'No tracks'}</p>
      </div>
      })}
    </div>
  </>;
}