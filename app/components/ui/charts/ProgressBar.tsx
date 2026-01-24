import { useEffect, useState } from "react";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  sublabel?: string;
  color?: string;
  animated?: boolean;
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({
  value,
  max = 100,
  label,
  sublabel,
  color = "#3b82f6",
  animated = true,
  showValue = true,
  size = "md",
}: ProgressBarProps) {
  const [animatedValue, setAnimatedValue] = useState(animated ? 0 : value);

  useEffect(() => {
    if (!animated) {
      setAnimatedValue(value);
      return;
    }

    const duration = 800;
    const startTime = Date.now();
    const startValue = animatedValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(startValue + (value - startValue) * eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, animated]);

  const percentage = max > 0 ? Math.min((animatedValue / max) * 100, 100) : 0;

  const heights = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          <div className="flex flex-col">
            {label && (
              <span className="text-sm font-medium text-slate-700">
                {label}
              </span>
            )}
            {sublabel && (
              <span className="text-xs text-slate-400">{sublabel}</span>
            )}
          </div>
          {showValue && (
            <span className="text-sm font-semibold text-slate-800">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full bg-slate-100 rounded-full overflow-hidden ${heights[size]}`}
      >
        <div
          className={`${heights[size]} rounded-full transition-all duration-300`}
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

// Multi-progress for domain stats
interface DomainProgressProps {
  domains: {
    code: string;
    name: string;
    implemented: number;
    total: number;
    color: string;
  }[];
  animated?: boolean;
}

export function DomainProgress({
  domains,
  animated = true,
}: DomainProgressProps) {
  return (
    <div className="flex flex-col gap-4">
      {domains.map((domain) => (
        <ProgressBar
          key={domain.code}
          value={domain.implemented}
          max={domain.total}
          label={domain.code}
          sublabel={domain.name}
          color={domain.color}
          animated={animated}
          size="md"
        />
      ))}
    </div>
  );
}
