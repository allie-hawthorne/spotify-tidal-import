import type { ButtonHTMLAttributes } from "react";
import { Button } from "./Button";
import type { Service } from "./LoginButton";
import { useImporterContext } from "../pages/EasyImport/ImportContext";

interface ImportButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  importSource?: Service;
}
export const ImportButton = ({ importSource, ...props }: ImportButtonProps) => {
  const {onImportClick, isImporting, importError} = useImporterContext();

  return <div className="flex flex-col gap-1 items-start">
    <Button onClick={onImportClick} disabled={isImporting} {...props}>
      {isImporting ? 'Importing...' : `Import ${importSource ? `from ${importSource}` : ''}`}
    </Button>
    {importError && <p className="text-red-500 text-sm">{importError}</p>}
  </div>;
}