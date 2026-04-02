import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
}

export function MetricCard({ label, value, change, changeType = "neutral", icon: Icon }: MetricCardProps) {
  const changeColor =
    changeType === "positive"
      ? "text-success"
      : changeType === "negative"
      ? "text-destructive"
      : "text-muted-foreground";

  return (
    <div className="glass-card p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <span className="metric-label">{label}</span>
        <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center">
          <Icon className="h-4 w-4 text-accent-foreground" />
        </div>
      </div>
      <div className="metric-value">{value}</div>
      {change && <span className={`text-xs font-medium ${changeColor}`}>{change}</span>}
    </div>
  );
}
