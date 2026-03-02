import { useCallback, useEffect, useState } from "react";
import { spotifyApi } from "../../api-helpers/spotify";
import { tidalApi } from "../../api-helpers/tidal";
import { PlaylistContainer } from "./PlaylistContainer";
import { Service } from "../../components/LoginButton";
import { ImportButton } from "../../components/ImportButton";

export interface Playlist {
  name: string;
  id: string;
}

export const Home = () => {
  const [spotifyPlaylists, setSpotifyPlaylists] = useState<Playlist[]>([]);
  const [tidalPlaylists, setTidalPlaylists] = useState<Playlist[]>([]);

  const [selectedPlaylists, setSelectedPlaylists] = useState<Playlist[]>([]);
  const [importSource, setImportSource] = useState<Service>();

  useEffect(() => {
    // TODO: get user id from spotify api instead of hardcoding it
    spotifyApi.playlists.getUsersPlaylists('1121194900')
      .then(d => setSpotifyPlaylists(d.items.map(({id, name}) => ({id, name}))))
      .catch(console.error);
  }, []);

  useEffect(() => {
    // TODO: get user id from tidal api instead of hardcoding it
    // TODO: could probably do with tidying this up for readability
    tidalApi.GET('/playlists', {params: {query: {"filter[owners.id]": ["207473666"]}}})
      .then(d => setTidalPlaylists(d.data?.data.map(({id, attributes}) => ({
        id,
        name: attributes?.name ?? '',
      })) ?? []))
      .catch(console.error);
  }, []);

  const onPlaylistSelect = (id: string, provider: Service) => {
    const isSelected = selectedPlaylists.some(p => p.id === id);
    // TODO: this is dumb and not extensible
    const setPlaylistsFn = provider === Service.Spotify ? spotifyPlaylists : tidalPlaylists;
    const thisPlaylist = setPlaylistsFn.find(p => p.id === id);
    const allButThisPlaylist = selectedPlaylists.filter(p => p.id !== id);

    if (!thisPlaylist) return;

    setImportSource(!isSelected || allButThisPlaylist.length ? provider : undefined);
    setSelectedPlaylists(prev => {
      if (provider !== importSource) return [thisPlaylist!];
      return isSelected ? allButThisPlaylist : [...prev, thisPlaylist!];
    });
  };

  const onImport = useCallback(async () => {
    const selectedSpotifyPlaylists = spotifyPlaylists.filter(p => selectedPlaylists.some(sp => sp.id === p.id));

    const playlistTracksRes = await Promise.all(selectedSpotifyPlaylists.map(p => spotifyApi.playlists.getPlaylistItems(p.id)));
    const playlistTracks = playlistTracksRes.map(({items}, i) => ({name: selectedSpotifyPlaylists[i].name, items: items.map(({track}) => ({title: track.name, artists: track.artists.map(a => a.name)}))}));
    console.log('Spotify tracks to import:', playlistTracks);
    await Promise.all(playlistTracks.map(async ({name: playlistName, items: inItems}) => {
      let items = inItems;
      const newPlaylist = await tidalApi.POST('/playlists', {body: {data: {attributes: {name: playlistName}, type: "playlists"}}});
      if (!newPlaylist.data?.data.id) {
        console.error('Failed to create playlist on Tidal');
        return;
      }

      let rateLimitedSearchResults;
      const successfulSearchResults: any[] = [];
      // TODO: DEAL WITH ANY
      let searchResults: any[];
      do {
        searchResults = await Promise.all(items.map(async ({title, artists}) => {
          return tidalApi.GET('/searchResults/{id}/relationships/tracks', {
            params: {path: {id: `${title} ${artists.join(', ')}`}}
          });
        }));
        items = items.filter((_, i) => searchResults[i].response.status === 200);
        rateLimitedSearchResults = searchResults.filter(r => r.response.status === 429);
        successfulSearchResults.push(...searchResults.filter(r => r.response.status === 200));
        console.log('Rate limited search results:', rateLimitedSearchResults);
      } while(rateLimitedSearchResults.length > 0);
      console.log('Search results for tracks:', successfulSearchResults);
      return tidalApi.POST(`/playlists/{id}/relationships/items`, {
        params: {path: {id: newPlaylist.data.data.id}},
        body: {
          data: successfulSearchResults.map(searchResult => {
            const track = searchResult.data?.data?.[0];
            if (!track?.id) {
              console.warn('No search results for track, skipping:', searchResult);
              return;
            }
            return {
              id: track.id,
              // TODO: try to remove typecast?
              type: track.type as 'tracks' | 'videos',
            };
          }).filter(x => !!x)
        }
      }).then(d => console.log('Tidal import response:', d)).catch(console.error);
    }));
  }, [selectedPlaylists, spotifyPlaylists]);

  return <div className="flex flex-col gap-5 items-center">
    <h1 className='text-center text-6xl'>Welcome!</h1>
    <div className='flex gap-2'>
      <PlaylistContainer
        playlists={spotifyPlaylists}
        selectedPlaylists={selectedPlaylists}
        onPlaylistSelect={onPlaylistSelect}
        provider={Service.Spotify}
      />
      <PlaylistContainer
        playlists={tidalPlaylists}
        selectedPlaylists={selectedPlaylists}
        onPlaylistSelect={onPlaylistSelect}
        provider={Service.Tidal}
      />
    </div>
    <ImportButton importSource={importSource} onClick={onImport} />
  </div>;
}