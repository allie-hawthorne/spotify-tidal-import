import type { ButtonHTMLAttributes } from "react";

export const Button = ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return <button className="bg-blue-500 rounded-2xl cursor-pointer p-1" {...props}>
    {children}
  </button>;
}