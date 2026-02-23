import { cn } from "@/lib/utils";

interface TagPillProps {
  name: string;
  color?: string;
  size?: "sm" | "md";
  onClick?: () => void;
  className?: string;
}

export default function TagPill({
  name,
  color = "#3B49DF",
  size = "sm",
  onClick,
  className,
}: TagPillProps) {
  const Component = onClick ? "button" : "span";

  return (
    <Component
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full font-medium transition-colors",
        size === "sm" && "px-2.5 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-sm",
        onClick && "cursor-pointer hover:opacity-80",
        className
      )}
      style={{
        backgroundColor: `${color}15`,
        color: color,
      }}
    >
      {name}
    </Component>
  );
}
