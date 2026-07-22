import pRetry from "@n8n/p-retry";
import { mapTidalAlbumsToUniversalAlbums, mapTidalArtistsToUniversalArtists, mapTidalTracksToUniversalTracks } from "../../mappers/tidalMappers";
import type { MinTrack } from "../../pages/EasyImport/useImportTracks";
import { tidalApi } from "../tidal";

export class TidalImporter {
  constructor() {}

    createPlaylist = async (name: string) => {
    const fn = () => tidalApi.POST('/playlists', {body: {data: {attributes: {name}, type: "playlists"}}});
    const newPlaylist = await pRetry(fn);
    if (!newPlaylist.data?.data.id) {
      console.error('No playlist ID returned from Tidal API when creating playlist:', name, newPlaylist);
      return;
    }
    return newPlaylist.data.data.id;
  };
  
  
  searchForTrack = async (title: string, artists: string[]) => {
    const query = `${title} ${artists.join(', ')}`;
    // TODO: Is this better than just removing the character?
    const encodedQuery = query.replace(/[!'()*]/g,(c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,);
  
    const fn = () => tidalApi.GET('/searchResults/{id}/relationships/tracks', {
      params: {path: {id: encodedQuery}, query: {include: ['tracks']}},
    });
    const res = await pRetry(fn);

    return mapTidalTracksToUniversalTracks(res);
  };

  searchForArtist = async (artistStr: string) => {
    const encodedQuery = artistStr.replace(/[!'()*]/g,(c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,);

    const fn = () => tidalApi.GET('/searchResults/{id}/relationships/artists', {
      params: {path: {id: encodedQuery}, query: {include: ['artists']}}
    });
    const res = await pRetry(fn);
    
    return mapTidalArtistsToUniversalArtists(res);
  }

  searchForAlbum = async (albumStr: string, artistStr: string) => {
    const encodedQuery = `${artistStr} ${albumStr}`.replace(/[!'()*]/g,(c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,);

    const fn = () => tidalApi.GET('/searchResults/{id}', {
      params: {path: {id: encodedQuery}, query: {include: ['albums', 'albums.artists']}}
    });
    const res = await pRetry(fn);
    
    return mapTidalAlbumsToUniversalAlbums(res);
  }

  addArtist = async (id: string) => {
    const fn = () => tidalApi.POST(`/userCollectionArtists/{id}/relationships/items`, {params: {path: {id: 'me'}}, body: {data: [{id, type: 'artists'}]}});
    const {response} = await pRetry(fn);

    return response.ok;
  }

  addAlbum = async (id: string) => {
    const fn = () => tidalApi.POST(`/userCollectionAlbums/{id}/relationships/items`, {params: {path: {id: 'me'}}, body: {data: [{id, type: 'albums'}]}});
    const {response} = await pRetry(fn);

    return response.ok;
  }

  addTrack = async (id: string) => {
    const fn = () => tidalApi.POST(`/userCollectionTracks/{id}/relationships/items`, {params: {path: {id: 'me'}}, body: {data: [{id, type: 'tracks'}]}});
    const {response} = await pRetry(fn);

    return response.ok;
  }

  addToPlaylist = async (playlistId: string, tracks: MinTrack[]) => {
    const fn = () => tidalApi.POST(`/playlists/{id}/relationships/items`, {
      params: {path: {id: playlistId}},
      body: {
        data: tracks.map(({id}) => ({id, type: 'tracks' as const}))
      }
    });
    const {response} = await pRetry(fn);

    return response.ok;
  };
}

// Allie: before i forget it might be cool to try to make use of others' code/software. 
// https://github.com/spotify2tidal/spotify_to_tidal
// https://www.tunemymusic.com - "ISRC/title/artist, de-duping, order preservation, edge-case handling"
// https://freeyourmusic.com
// https://musicapi.com
// MusicBrainz