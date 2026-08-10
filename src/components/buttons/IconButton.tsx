import type { MdiReactIconComponentType } from "mdi-react";
import type { ButtonHTMLAttributes } from "react"

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: MdiReactIconComponentType;
}
export const IconButton = ({icon: Icon, className, ...props}: IconButtonProps) => {
  return <button className={`enabled:cursor-pointer enabled:text-purple-300 ${className || ''}`} {...props}>
    <Icon />
  </button>
}