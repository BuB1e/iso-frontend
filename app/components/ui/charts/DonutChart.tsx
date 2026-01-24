import { useEffect, useState } from "react";

interface DonutChartProps {
  segments: {
    value: number;
    color: string;
    label: string;
  }[];
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
  centerLabel?: string;
  animated?: boolean;
}

export function DonutChart({
  segments,
  size = 180,
  strokeWidth = 24,
  showPercentage = true,
  centerLabel,
  animated = true,
}: DonutChartProps) {
  const [animationProgress, setAnimationProgress] = useState(animated ? 0 : 1);

  useEffect(() => {
    if (!animated) return;

    const duration = 1000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing function for smooth animation
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimationProgress(eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [animated]);

  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Calculate segment positions
  let cumulativePercent = 0;
  const segmentData = segments.map((segment) => {
    const percent = total > 0 ? segment.value / total : 0;
    const offset = cumulativePercent;
    cumulativePercent += percent;
    return {
      ...segment,
      percent,
      offset,
      dashArray: percent * circumference * animationProgress,
      dashOffset: -offset * circumference * animationProgress,
    };
  });

  // Calculate main percentage (first segment or implemented)
  const mainPercent =
    total > 0 ? Math.round(((segments[0]?.value || 0) / total) * 100) : 0;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
        />

        {/* Segments */}
        {segmentData.map((segment, index) => (
          <circle
            key={index}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${segment.dashArray} ${circumference}`}
            strokeDashoffset={segment.dashOffset}
            strokeLinecap="round"
            className="transition-all duration-300"
            style={{
              transform: `rotate(${segment.offset * 360 * animationProgress}deg)`,
              transformOrigin: "center",
            }}
          />
        ))}
      </svg>

      {/* Center content */}
      {showPercentage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-slate-800">
            {Math.round(mainPercent * animationProgress)}%
          </span>
          {centerLabel && (
            <span className="text-xs text-slate-500">{centerLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

// Legend component
interface DonutLegendProps {
  items: {
    label: string;
    value: number;
    color: string;
  }[];
}

export function DonutLegend({ items }: DonutLegendProps) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-sm text-slate-600">{item.label}</span>
          <span className="text-sm font-semibold text-slate-800 ml-auto">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
