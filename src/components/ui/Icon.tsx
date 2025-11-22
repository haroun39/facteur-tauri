import * as React from "react";

import { icons } from "lucide-react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: keyof typeof icons;
  color?: string;
  className?: string;
  size?: string | number;
}

const Icon = ({ name, color, className, size, ...props }: IconProps) => {
  const LucideIcon = icons[name];
  return (
    <LucideIcon color={color} size={size} className={className} {...props} />
  );
};

export default Icon;
