import type { InputHTMLAttributes } from "react";

const CHECKED_BACKGROUND = [
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 13l4 4L19 7'/%3E%3C/svg%3E")`,
  "linear-gradient(to bottom right, #c084fc, #4f46e5)",
].join(', ');

export const Checkbox = (props: InputHTMLAttributes<HTMLInputElement>) => {
  const {checked, disabled} = props;
  return <input className={`appearance-none w-6 h-6 rounded-lg shrink-0 bg-center bg-no-repeat bg-size-[14px,100%] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${checked ? "shadow-[0_0_12px_-1px_rgba(139,92,246,0.7)]" : "bg-white/5 border border-white/20"} ${disabled ? "opacity-50" : ""}`}
    {...props}
    type="checkbox"
    style={checked ? { backgroundImage: CHECKED_BACKGROUND } : undefined}
  />;
};
