import { cn } from "~/lib/utils";

export type BadgeVariant = "success" | "warning" | "error" | "info" | "default";

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  error: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
  default: "bg-slate-100 text-slate-700",
};

/**
 * Reusable status badge component
 */
export function StatusBadge({
  label,
  variant = "default",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-medium",
        variantStyles[variant],
        className,
      )}
    >
      {label}
    </span>
  );
}

/**
 * Status badge variants for common use cases
 */
export const statusVariants = {
  implemented: { label: "Implemented", variant: "success" as BadgeVariant },
  partial: {
    label: "Partially Implemented",
    variant: "warning" as BadgeVariant,
  },
  notImplemented: {
    label: "Not Implemented",
    variant: "error" as BadgeVariant,
  },
  approved: { label: "Approved", variant: "success" as BadgeVariant },
  pending: { label: "Pending", variant: "warning" as BadgeVariant },
  rejected: { label: "Rejected", variant: "error" as BadgeVariant },
  active: { label: "Active", variant: "success" as BadgeVariant },
  inactive: { label: "Inactive", variant: "default" as BadgeVariant },
  draft: { label: "Draft", variant: "default" as BadgeVariant },
  inProgress: { label: "In Progress", variant: "info" as BadgeVariant },
  completed: { label: "Completed", variant: "success" as BadgeVariant },
};
