import { StatCard } from "./stat-card";

interface Stats {
  total: number;
  mid: number;
  consultancy: number;
  large: number;
  locations: number;
}

interface StatsBarProps {
  stats: Stats;
}

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div
      className="rounded-lg p-4 grid grid-cols-2 sm:grid-cols-5 gap-4"
      style={{ backgroundColor: "var(--color-base)", border: "1px solid var(--color-edge)" }}
    >
      <StatCard label="Total" value={stats.total} />
      <StatCard label="Mid-size" value={stats.mid} color="var(--color-info)" />
      <StatCard label="Consultancy" value={stats.consultancy} color="var(--color-success)" />
      <StatCard label="Large" value={stats.large} color="var(--color-accent)" />
      <StatCard label="Locations" value={stats.locations} />
    </div>
  );
}
