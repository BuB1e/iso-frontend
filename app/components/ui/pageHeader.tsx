import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { cn } from "~/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  backLink?: string;
  backLabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Reusable page header component with optional back link, icon, and actions
 */
export function PageHeader({
  title,
  description,
  backLink,
  backLabel = "Back",
  icon: Icon,
  actions,
  badge,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-row items-center justify-between py-4 bg-white border-b border-slate-200",
        className,
      )}
    >
      <div className="flex flex-row items-center gap-4">
        {/* Back link */}
        {backLink && (
          <Link
            to={backLink}
            className="flex items-center gap-1 text-slate-600 hover:text-main-blue transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{backLabel}</span>
          </Link>
        )}

        {/* Icon */}
        {Icon && (
          <div className="p-2 bg-main-blue/10 rounded-lg">
            <Icon className="w-5 h-5 text-main-blue" />
          </div>
        )}

        {/* Title & Description */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800">{title}</h1>
            {badge}
          </div>
          {description && (
            <p className="text-slate-500 text-sm mt-0.5">{description}</p>
          )}
          {children}
        </div>
      </div>

      {/* Actions */}
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

/**
 * Simple section header for use within pages
 */
export function SectionHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      <div>
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        {description && (
          <p className="text-sm text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
      {actions}
    </div>
  );
}
