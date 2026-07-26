import type { ButtonHTMLAttributes } from "react";

export const Button = ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return <button className="bg-gray-100 text-black text-sm rounded-xl px-3 py-1 cursor-pointer" {...props}>
    {children}
  </button>;
}