import { Card } from "./Card";

type Trend = "up" | "down" | "neutral";

export interface KPICardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: Trend;
  className?: string;
}

const trendConfig: Record<Trend, { color: string; path: string }> = {
  up: { color: "text-success-500", path: "M12 19V5M5 12l7-7 7 7" },
  down: { color: "text-error-500", path: "M12 5v14M5 12l7 7 7-7" },
  neutral: { color: "text-subtle", path: "M5 12h14" },
};

function TrendIcon({ trend }: { trend: Trend }) {
  const { color, path } = trendConfig[trend];
  return (
    <svg
      className={`h-4 w-4 ${color}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

export function KPICard({ label, value, sub, trend, className = "" }: KPICardProps) {
  return (
    <Card variant="default" className={className}>
      <p className="text-sm font-medium text-subtle">{label}</p>
      <p className="mt-2 text-3xl font-bold text-heading">{value}</p>
      {(sub || trend) && (
        <div className="mt-2 flex items-center gap-1">
          {trend && <TrendIcon trend={trend} />}
          {sub && <span className="text-sm text-subtle">{sub}</span>}
        </div>
      )}
    </Card>
  );
}
