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
      "relative w-full rounded-xl border text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-soft",
      compact ? "p-2.5" : "p-4",
      selected
        ? "border-primary/70 bg-accent/60 shadow-gold ring-1 ring-primary/40"
        : "border-border bg-card",
    )}
  >
    {selected && (
      <div className={cn(
        "absolute flex items-center justify-center rounded-full bg-gradient-gold text-primary-foreground shadow-gold",
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