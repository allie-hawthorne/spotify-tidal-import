import { tidalApi } from "../tidal";

export class TidalImporter {
  constructor() {}

    createPlaylist = async (name: string) => {
    const newPlaylist = await tidalApi.POST('/playlists', {body: {data: {attributes: {name}, type: "playlists"}}});
    if (newPlaylist.response.status === 429) {
      console.warn('Rate limited by Tidal API when creating playlist:', name);
      return 429;
    }
    if (newPlaylist.response.status !== 201) {
      console.error('Error creating playlist on Tidal:', name, newPlaylist);
      return;
    }
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
  
    const searchResults = await tidalApi.GET('/searchResults/{id}/relationships/tracks', {
      params: {path: {id: encodedQuery}}
    });
    if (searchResults.response.status === 429) {
      console.warn('Rate limited by Tidal API when searching for track:', query);
      return 429;
    }
    if (searchResults.response.status !== 200) {
      console.error('Error searching for track on Tidal:', query, searchResults);
      return;
    }
    const track = searchResults.data?.data?.[0];
    if (!track?.id) {
      console.warn('No search results for track on Tidal:', query);
      return;
    }
    return track;
  };

  searchForArtist = async (artistStr: string) => {
    const encodedQuery = artistStr.replace(/[!'()*]/g,(c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,);

    // This is good, we can use the include above to get track name
    const searchResults = await tidalApi.GET('/searchResults/{id}/relationships/artists', {
      params: {path: {id: encodedQuery}, query: {include: ['artists']}}
    });

    if (searchResults.response.status === 429) return 429;
    
    if (searchResults.error) {
      console.error('ERROR:', searchResults.error)
      return;
    }
    
    return searchResults.data.data?.map(d => searchResults.data.included?.find(a => a.id === d.id))
  }

  searchForAlbum = async (albumStr: string, artistStr: string) => {
    const encodedQuery = `${artistStr} ${albumStr}`.replace(/[!'()*]/g,(c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,);

    const {response, error, data: searchResults} = await tidalApi.GET('/searchResults/{id}', {
      params: {path: {id: encodedQuery}, query: {include: ['albums', 'albums.artists']}}
    });

    if (response.status === 429) return 429;
    
    if (error) {
      console.error('ERROR:', error)
      return;
    }

    console.log(searchResults);
    
    // This is sorted by relevance
    const orderedAlbums = searchResults.data.relationships?.albums.data;

    const orderedAlbumsWithArtists = orderedAlbums?.map(minAlbum => {
      const album = searchResults.included?.find(a => a.id === minAlbum.id);

      if (!album?.attributes || !("albumType" in album.attributes)) return;

      const relationships = album && "relationships" in album ? album.relationships : undefined;

      const minArtists = relationships && "artists" in relationships ? relationships.artists.data : undefined;

      const artists = minArtists?.flatMap(minArtist => searchResults.included?.filter(a => a.id === minArtist.id));
      
      return {...album, artists};
    });

    console.log("Ordered albums with artists:", orderedAlbumsWithArtists);
    
    return orderedAlbumsWithArtists;
  }

  addArtist = async (id: string) => {
    const response = await tidalApi.POST(`/userCollectionArtists/{id}/relationships/items`, {params: {path: {id: 'me'}}, body: {data: [{id, type: 'artists'}]}});
    if (response.response.status === 429) {
      console.warn('Rate limited by Tidal API when adding artist:', id);
      return 429;
    }
    if (!response.response.ok) {
      console.error('Error adding artist on Tidal:', id, response);
      return false;
    }
    return true;
  }

  addAlbum = async (id: string) => {
    const response = await tidalApi.POST(`/userCollectionAlbums/{id}/relationships/items`, {params: {path: {id: 'me'}}, body: {data: [{id, type: 'albums'}]}});
    if (response.response.status === 429) {
      console.warn('Rate limited by Tidal API when adding album:', id);
      return 429;
    }
    if (!response.response.ok) {
      console.error('Error adding artist on Tidal:', id, response);
      return false;
    }
    return true;
  }

  addToPlaylist = async (playlistId: string, trackIds: string[]) => {
    const response = await tidalApi.POST(`/playlists/{id}/relationships/items`, {
      params: {path: {id: playlistId}},
      body: {
        data: trackIds.map(id => ({id, type: 'tracks' as const}))
      }
    });
    if (response.response.status === 429) {
      console.warn('Rate limited by Tidal API when adding tracks to playlist:', playlistId);
      return 429;
    }
    if (!response.response.ok) {
      console.error('Error adding tracks to playlist on Tidal:', playlistId, response);
      return false;
    }
    return true;
  };
}

// Allie: before i forget it might be cool to try to make use of others' code/software. 
// https://github.com/spotify2tidal/spotify_to_tidal
// https://www.tunemymusic.com - "ISRC/title/artist, de-duping, order preservation, edge-case handling"
// https://freeyourmusic.com
// https://musicapi.com
// MusicBrainz