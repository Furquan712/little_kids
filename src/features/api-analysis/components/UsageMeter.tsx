function severityColor(percent: number): { fill: string; track: string } {
  if (percent >= 90) return { fill: "var(--plat-danger)", track: "color-mix(in srgb, var(--plat-danger) 15%, transparent)" };
  if (percent >= 70) return { fill: "var(--plat-warning)", track: "color-mix(in srgb, var(--plat-warning) 15%, transparent)" };
  return { fill: "var(--plat-success)", track: "color-mix(in srgb, var(--plat-success) 15%, transparent)" };
}

export function UsageMeter({ percent, label }: { percent: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const { fill, track } = severityColor(clamped);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs text-plat-ink-muted">
        <span>{label}</span>
        <span className="font-medium text-plat-ink">{clamped.toFixed(1)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: track }}>
        <div
          className="h-full rounded-full transition-[width]"
          style={{ width: `${clamped}%`, backgroundColor: fill }}
        />
      </div>
    </div>
  );
}
