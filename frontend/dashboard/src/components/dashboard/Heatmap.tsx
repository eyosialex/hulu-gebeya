import { useMemo } from "react";

export function Heatmap() {
  const cells = useMemo(() => {
    return Array.from({ length: 365 }, (_, i) => {
      const seed = (i * 9301 + 49297) % 233280;
      const r = seed / 233280;
      const v = r < 0.55 ? 0 : r < 0.75 ? 1 : r < 0.9 ? 2 : 3;
      return v;
    });
  }, []);

  const colors = [
    "bg-surface/60",
    "bg-primary/30",
    "bg-primary/60",
    "bg-primary-glow",
  ];

  return (
    <div className="overflow-x-auto">
      <div
        className="grid grid-flow-col grid-rows-7 gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${Math.ceil(365 / 7)}, minmax(0, 1fr))` }}
      >
        {cells.map((v, i) => (
          <div
            key={i}
            className={`h-2.5 w-2.5 rounded-[3px] ${colors[v]} transition-colors`}
            title={`Day ${i + 1}`}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>Less</span>
        {colors.map((c, i) => (
          <span key={i} className={`h-2.5 w-2.5 rounded-[3px] ${c}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
