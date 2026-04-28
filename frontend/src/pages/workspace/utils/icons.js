import * as LucideIcons from "lucide-react";

export const ICONS = Object.entries(LucideIcons).filter(
  ([name]) => name[0] === name[0].toUpperCase()
);

export const getIconByName = (name) => {
  return LucideIcons[name] || LucideIcons.Square;
};
