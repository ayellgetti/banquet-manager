import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const SelectableCard = ({
  selected,
  onClick,
  title,
  subtitle,
  price,
  children,
  compact,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle?: string;
  price?: string;
  children?: React.ReactNode;
  compact?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "relative w-full rounded-lg border text-left transition-all hover:border-primary/40 hover:shadow-sm",
      compact ? "p-2.5" : "p-4",
      selected
        ? "border-primary ring-2 ring-primary/20 bg-primary/5"
        : "border-border bg-card",
    )}
  >
    {selected && (
      <div className={cn(
        "absolute flex items-center justify-center rounded-full bg-primary text-primary-foreground",
        compact ? "right-1.5 top-1.5 h-4 w-4" : "right-3 top-3 h-6 w-6",
      )}>
        <Check className={compact ? "h-2.5 w-2.5" : "h-4 w-4"} />
      </div>
    )}
    <div className={cn("font-medium text-foreground pr-5", compact ? "text-sm leading-tight" : "")}>{title}</div>
    {subtitle && <div className={cn("text-muted-foreground", compact ? "mt-0.5 text-xs" : "mt-0.5 text-sm")}>{subtitle}</div>}
    {price && <div className={cn("font-semibold text-primary", compact ? "mt-1 text-xs" : "mt-2 text-sm")}>{price}</div>}
    {children}
  </button>
);