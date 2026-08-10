import AlertCircleOutlineIcon from "mdi-react/AlertCircleOutlineIcon";
import { useState } from "react";
import type { Category } from "./ResultsSection";

interface ImportErrorSectionProps {
  categoriesWithErrors: Category[];
}
export const ImportErrorSection = ({categoriesWithErrors}: ImportErrorSectionProps) => {
  const totalErrors = categoriesWithErrors.reduce((sum, c) => sum + c.erroredCount, 0);
  
  const [activeTab, setActiveTab] = useState<string | undefined>(() => categoriesWithErrors[0]?.key);
    const activeCategory = categoriesWithErrors.find(c => c.key === activeTab) ?? categoriesWithErrors[0];
  
  return <div className="flex flex-col gap-2.5 min-w-0 bg-red-500/5 border border-red-500/20 rounded-xl p-3">
    <div className="flex items-center gap-1.5 text-sm font-medium text-red-400">
      <AlertCircleOutlineIcon size={16} />
      {totalErrors} item{totalErrors === 1 ? '' : 's'} not added
    </div>
    <div className="flex gap-1 min-w-0 overflow-x-auto">
      {categoriesWithErrors.map(c => (
        <button
          key={c.key}
          type="button"
          onClick={() => setActiveTab(c.key)}
          className={`shrink-0 text-xs font-medium rounded-full px-2.5 py-1 transition-colors duration-200 cursor-pointer ${
            c.key === activeCategory.key ? "bg-red-500/15 text-red-300" : "text-red-300/60 hover:text-red-300"
          }`}
        >
          {c.name} · {c.erroredCount}
        </button>
      ))}
    </div>
    <ul className="flex flex-col gap-1.5 min-w-0 max-h-48 overflow-y-auto text-sm text-red-300/80 list-none">
      {activeCategory.errorItems}
    </ul>
  </div>
}