import { Button } from "./Button";
import { useSpotify } from "../api-helpers/SpotifyContext";

export const ExportButton = () => {
  const {isLoading} = useSpotify();

  const onExportClick = () => {
    console.log('clicked');
  };
  
  return <Button disabled={isLoading} onClick={onExportClick}>Export</Button>;
};