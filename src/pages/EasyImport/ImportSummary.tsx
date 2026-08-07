import type { Resource } from "../../api-helpers/SpotifyContext";

type ImportSummaryProps = {
  resource: Resource<unknown>;
  label: string;
  succeededCount: number;
  preLabel?: string;
};

export const ImportSummary = ({resource: {items, loading, total, progress}, label, succeededCount, preLabel}: ImportSummaryProps) => {
  if (loading) return <p>Loading {label}... ({progress}/{total})</p>;

  if (!items.length) return <p>We couldn't get your {label}</p>;

  return <p>Import {preLabel} {items.length} {label} {!!succeededCount && `(${succeededCount}/${items.length})`}</p>;
};
