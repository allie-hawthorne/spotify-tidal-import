import type { Category } from "./ResultsSection";

export const ItemResult = ({ category }: {category: Category}) => {
  const { erroredCount, name, succeededCount, total } = category;

  const attempted = succeededCount + erroredCount;
  const succeededPct = total ? Math.min(100, Math.round((succeededCount / total) * 100)) : 0;
  const errorPct = total ? Math.min(100, Math.round((erroredCount / total) * 100)) : 0;

  return <div className="flex flex-col gap-1 min-w-0">
    <div className="flex justify-between items-baseline gap-2 text-sm min-w-0">
      <span className="font-medium truncate">{name}</span>
      <span className="text-xs tabular-nums flex items-center gap-1 shrink-0">{attempted} / {total}</span>
    </div>
    <div className="flex h-1 rounded-full bg-white/10 overflow-hidden">
      <div className="h-full rounded-l-full bg-purple-300 transition-[width] duration-300" style={{width: `${succeededPct}%`}} />
      <div className="h-full rounded-r-full bg-red-400 transition-[width] duration-300" style={{width: `${errorPct}%`}} />
    </div>
  </div>;
}