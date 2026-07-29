import { Button } from "./Button";
import { useSpotify } from "../api-helpers/SpotifyContext";
import JSZip from "jszip";

export const ExportButton = () => {
  const {isLoading, albumData, artistData, playlistData, trackData} = useSpotify();

  const onExportClick = async () => {
    const zip = new JSZip();
    zip.file('saved-albums.json', JSON.stringify(albumData.items));
    zip.file('saved-artists.json', JSON.stringify(artistData.items));
    zip.file('playlists.json', JSON.stringify(playlistData.items));
    zip.file('saved-tracks.json', JSON.stringify(trackData.items));

    const blob = await zip.generateAsync({type: 'blob'});
    const encodedUri = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.setAttribute("href", encodedUri);
    link.setAttribute('target', "_blank");
    link.setAttribute('rel', "noreferrer noopener");
    link.setAttribute("download", 'test.zip');

    link.click();
  };
  
  return <Button disabled={isLoading} onClick={onExportClick}>Export</Button>;
};