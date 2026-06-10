import { cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Construction,
} from "lucide-react";
import type { ClaimClassification, TrendDirection } from "@/types";

// Dashboard Card
export function DashboardCard({
  title,
  value,
  trend,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  trend?: "up" | "down" | "stable";
  subtitle?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 sm:p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1 text-card-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1 truncate">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-muted text-muted-foreground shrink-0">{icon}</div>
        )}
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-3">
          {trend === "up" && <TrendingUp className="w-4 h-4 text-success" />}
          {trend === "down" && <TrendingDown className="w-4 h-4 text-destructive" />}
          {trend === "stable" && <Minus className="w-4 h-4 text-muted-foreground" />}
          <span
            className={cn(
              "text-xs font-medium",
              trend === "up" && "text-success",
              trend === "down" && "text-destructive",
              trend === "stable" && "text-muted-foreground"
            )}
          >
            {trend === "up" ? "Increasing" : trend === "down" ? "Decreasing" : "Stable"}
          </span>
        </div>
      )}
    </div>
  );
}

// Classification Badge
const classificationStyles: Record<ClaimClassification, string> = {
  TRUE: "bg-green-100 text-green-800 border-green-200",
  FALSE: "bg-red-100 text-red-800 border-red-200",
  MISLEADING: "bg-orange-100 text-orange-800 border-orange-200",
  MISSING_CONTEXT: "bg-yellow-100 text-yellow-800 border-yellow-200",
  EXAGGERATED: "bg-purple-100 text-purple-800 border-purple-200",
  UNVERIFIED: "bg-gray-100 text-gray-800 border-gray-200",
  SATIRE: "bg-blue-100 text-blue-800 border-blue-200",
};

export function ClassificationBadge({
  classification,
}: {
  classification: ClaimClassification;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
        classificationStyles[classification]
      )}
    >
      {classification.replace("_", " ")}
    </span>
  );
}

// Trend Badge
const trendStyles: Record<TrendDirection, string> = {
  spiking: "bg-red-100 text-red-700",
  rising: "bg-orange-100 text-orange-700",
  falling: "bg-green-100 text-green-700",
  stable: "bg-gray-100 text-gray-700",
};

export function TrendBadge({ direction }: { direction: TrendDirection }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        trendStyles[direction]
      )}
    >
      {direction === "spiking" && <AlertTriangle className="w-3 h-3 mr-1" />}
      {direction === "rising" && <TrendingUp className="w-3 h-3 mr-1" />}
      {direction === "falling" && <TrendingDown className="w-3 h-3 mr-1" />}
      {direction.charAt(0).toUpperCase() + direction.slice(1)}
    </span>
  );
}

// Score Gauge
export function ScoreGauge({
  score,
  label,
  size = "md",
}: {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "w-12 h-12", md: "w-16 h-16", lg: "w-24 h-24" };
  const textSizes = { sm: "text-xs", md: "text-sm", lg: "text-lg" };
  const color =
    score >= 80 ? "text-destructive" : score >= 60 ? "text-warning" : "text-success";
  const strokeColor =
    score >= 80 ? "stroke-red-500" : score >= 60 ? "stroke-yellow-500" : "stroke-green-500";

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={cn("relative", sizes[size])}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            className={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <span className={cn("absolute inset-0 flex items-center justify-center font-bold", textSizes[size], color)}>
          {score}
        </span>
      </div>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  );
}

// Platform Icon
export function PlatformBadge({ platform }: { platform: string }) {
  const colors: Record<string, string> = {
    X: "bg-gray-900 text-white",
    Reddit: "bg-orange-500 text-white",
    YouTube: "bg-red-600 text-white",
    TikTok: "bg-gray-900 text-white",
    Instagram: "bg-pink-600 text-white",
    Facebook: "bg-blue-600 text-white",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        colors[platform] || "bg-gray-200 text-gray-800"
      )}
    >
      {platform}
    </span>
  );
}

// Empty State / Coming Soon
export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="p-4 rounded-full bg-muted mb-4">
        <Construction className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground max-w-md">{description}</p>
      <div className="mt-4 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
        Coming Soon
      </div>
    </div>
  );
}

// Page Header
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4 sm:mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

// Stat Pill
export function StatPill({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
