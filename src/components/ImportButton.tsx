import type { ButtonHTMLAttributes } from "react";
import { Button } from "./Button";
import type { Service } from "./LoginButton";

interface ImportButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  importSource?: Service;
}
export const ImportButton = ({ importSource, ...props }: ImportButtonProps) => {
  return <Button className="bg-blue-500 rounded-2xl cursor-pointer p-1" {...props}>
    Import {importSource ? `from ${importSource}` : ''}
  </Button>;
}