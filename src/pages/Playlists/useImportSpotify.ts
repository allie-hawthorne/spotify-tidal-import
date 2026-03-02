import { useCallback } from "react";
import type { Playlist } from "./Playlists";
import { spotifyApi } from "../../api-helpers/spotify";
import { tidalApi } from "../../api-helpers/tidal";

export const useImportSpotify = (spotifyPlaylists: Playlist[], selectedPlaylists: Playlist[]) => {
    const onImportClick = useCallback(async () => {
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
    
    return { onImportClick };
}