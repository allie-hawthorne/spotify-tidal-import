import RefreshIcon from 'mdi-react/RefreshIcon';
import { useSpotify } from '../api-helpers/SpotifyContext';
import { IconButton } from './IconButton';

const formatRelativeTime = (timestamp: number): string => {
  const diffSec = Math.round((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'just now';

  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;

  const diffDay = Math.round(diffHour / 24);
  return `${diffDay}d ago`;
};


export const SyncStatus = () => {
  const {isLoading, syncedAt, refresh} = useSpotify();
  
  if (!syncedAt) return null;
  return <>
    <span>Synced {formatRelativeTime(syncedAt)}</span>
    <IconButton icon={RefreshIcon} onClick={refresh} disabled={isLoading} />
  </>;
};
