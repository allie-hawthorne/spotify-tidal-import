import type { ButtonHTMLAttributes } from "react";
import { Button } from "./Button";

export const ImportButton = ({ onClick, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return <Button className="bg-blue-500 rounded-2xl cursor-pointer p-1" onClick={onClick} {...props}>
    Import
  </Button>;
}