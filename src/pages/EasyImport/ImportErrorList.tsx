import AlertCircleOutlineIcon from "mdi-react/AlertCircleOutlineIcon";
import PlusIcon from "mdi-react/PlusIcon";
import MinusIcon from "mdi-react/MinusIcon";
import { useState, type MouseEvent, type PropsWithChildren } from "react";

const pluralize = (word: string, count: number) => {
  if (count === 1) return word;
  return `${word}s`;
};

type ImportErrorListProps = PropsWithChildren<{
  count: number;
  label: string;
}>;

export const ImportErrorList = ({ count, label, children }: ImportErrorListProps) => {
  const [open, setOpen] = useState(false);
  const toggle = (e: MouseEvent) => {
    e.preventDefault();
    setOpen(s => !s);
  };

  if (!count) return null;

  return <details className="flex flex-col bg-red-500/5 border border-red-500/20 rounded-xl px-3" open={open}>
    <summary className="flex justify-between py-3 text-sm font-medium text-red-400 cursor-pointer" onClick={toggle}>
      <div className="flex items-center gap-1.5"><AlertCircleOutlineIcon /> {count} {pluralize(label, count)} not added</div>
      {open ? <MinusIcon /> : <PlusIcon />}
    </summary>
    <ul className="flex flex-col gap-1.5 max-h-48 overflow-y-auto text-sm text-red-300/80 list-none">
      {children}
    </ul>
  </details>;
};
