import RefreshIcon from 'mdi-react/RefreshIcon';
import { useSpotify } from '../api-helpers/SpotifyContext';
import { useImporterContext } from '../pages/import-logic/ImportContext';
import { IconButton } from './buttons/IconButton';
import { useExport } from '../local/useExport';
import DownloadIcon from 'mdi-react/DownloadIcon';

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


export const Toolbar = () => {
  const {isLoading, syncedAt, refresh} = useSpotify();
  const {clearImportProgress} = useImporterContext();
  const onExportClick = useExport();

  if (!syncedAt) return null;

  const handleRefresh = () => {
    // A resync means "start fresh from what Spotify has now" - old import results were
    // keyed off the previous snapshot and could be misleading (or skip items that changed).
    clearImportProgress();
    refresh();
  };

  return <div className="flex justify-end items-center gap-2 text-gray-400 text-sm">
    <span>Synced {formatRelativeTime(syncedAt)}</span>
    <IconButton icon={RefreshIcon} onClick={handleRefresh} disabled={isLoading} />
    <IconButton icon={DownloadIcon} onClick={onExportClick} disabled={isLoading} />
  </div>;
};
