type CollectionSummaryProps = {
  loading: boolean;
  itemCount: number;
  loadingProgress: number;
  loadingTotal: number;
  label: string;
  succeededCount: number;
};

export const CollectionSummary = ({
  loading,
  itemCount,
  loadingProgress,
  loadingTotal,
  label,
  succeededCount
}: CollectionSummaryProps) => {
  if (loading) return <p>Loading {label}... ({loadingProgress}/{loadingTotal})</p>;

  if (!itemCount) return <p>We couldn't get your {label}</p>;

  return <p>Import {itemCount} {label} {!!succeededCount && `(${succeededCount}/${itemCount})`}</p>;
};
