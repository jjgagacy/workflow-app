import { useMemo } from "react";
import { IconName, iconSets } from "../app-icon/icons";

interface IconProps {
  icon: IconName;
  size?: number;
  spin?: boolean;
  strokeWidth?: number;
  className?: string;
  onClick?: () => void;
}

export default function Icon({ icon, size, spin, strokeWidth, className, onClick }: IconProps) {
  const IconComponent = useMemo(() => {
    const IconComponent = iconSets[icon as keyof typeof iconSets];
    if (IconComponent) {
      return IconComponent;
    }
    console.warn(`Icon "${icon}" not found in iconSets.`);
    return null;
  }, [icon]);

  if (!IconComponent) {
    return null;
  }

  const iconClasses = useMemo(() => {
    const classes = [];
    if (spin) classes.push('animate-spin');
    if (strokeWidth) classes.push(`stroke-[${strokeWidth}]`);
    if (className) classes.push(className);
    return classes.join(' ');
  }, [spin, strokeWidth, className]);

  return (
    <IconComponent
      className={iconClasses}
      aria-hidden="true"
      focusable="false"
      role="img"
      data-icon={icon}
      onClick={onClick}
    />
  );
}