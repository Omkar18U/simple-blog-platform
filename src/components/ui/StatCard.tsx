import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
  trend = "neutral",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-2xl p-5 shadow-sm border border-border flex flex-col gap-3",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted">{title}</span>
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        {change && (
          <p
            className={cn(
              "text-xs font-medium mt-1",
              trend === "up" && "text-success",
              trend === "down" && "text-error",
              trend === "neutral" && "text-muted"
            )}
          >
            {change}
          </p>
        )}
      </div>
    </div>
  );
}
