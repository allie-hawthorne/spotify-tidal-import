import type { ButtonHTMLAttributes } from "react";

export const Button = ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => {
  return <button className="bg-purple-100 not-disabled:hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed duration-300 text-black text-sm rounded-xl px-3 py-1 cursor-pointer" {...props}>
    {children}
  </button>;
}