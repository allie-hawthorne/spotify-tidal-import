import type { ButtonHTMLAttributes } from "react";
import { Button } from "./Button";
import type { Service } from "./LoginButton";

interface ImportButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  importSource?: Service;
}
export const ImportButton = ({ importSource, ...props }: ImportButtonProps) => {
  return <Button {...props}>
    Import {importSource ? `from ${importSource}` : ''}
  </Button>;
}