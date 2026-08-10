import type { ButtonHTMLAttributes } from "react";
import { Button } from "./Button";
import type { Service } from "./LoginButton";
import { useImporterContext } from "../../pages/EasyImport/ImportContext";

interface ImportButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  importSource?: Service;
}
export const ImportButton = ({ importSource, ...props }: ImportButtonProps) => {
  const {onImportClick} = useImporterContext();

  return <Button onClick={onImportClick} {...props}>
    Import {importSource ? `from ${importSource}` : ''}
  </Button>;
}