import RefreshIcon from 'mdi-react/RefreshIcon';

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

type SyncStatusProps = {
  syncedAt: number | null;
  isSyncing: boolean;
  onRefresh: () => void;
};

export const SyncStatus = ({ syncedAt, isSyncing, onRefresh }: SyncStatusProps) => {
  if (!syncedAt) return null;
  return <div className="flex items-center gap-2 text-sm text-gray-400">
    <button className="enabled:cursor-pointer enabled:text-purple-300" disabled={isSyncing} onClick={isSyncing ? undefined : onRefresh}><RefreshIcon /></button>
    <span>Synced {formatRelativeTime(syncedAt)}</span>
  </div>;
};
