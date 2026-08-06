import { Button } from "./Button";
import { useSpotify } from "../api-helpers/SpotifyContext";
import JSZip from "jszip";
import Papa from "papaparse";

export const ExportButton = () => {
  const {isLoading, albumData, artistData, playlistData, trackData, podcastData} = useSpotify();

  const onExportClick = async () => {
    const zip = new JSZip();
    zip.file('saved-albums.csv', Papa.unparse(albumData.items));
    zip.file('saved-artists.csv', Papa.unparse(artistData.items));
    zip.file('playlists.csv', Papa.unparse(playlistData.items));
    zip.file('saved-tracks.csv', Papa.unparse(trackData.items));
    zip.file('saved-podcasts.csv', Papa.unparse(podcastData.items));

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