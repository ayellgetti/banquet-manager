import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ListViewMode } from "@/hooks/useListViewMode";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

type Props = {
  value: ListViewMode;
  onChange: (mode: ListViewMode) => void;
  className?: string;
};

export const ViewModeToggle = ({ value, onChange, className }: Props) => {
  const { t } = useT();

  return (
    <div className={cn("inline-flex shrink-0 rounded-lg border border-border/70 bg-muted/30 p-1", className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", value === "grid" && "bg-background shadow-sm")}
        aria-label={t("common.view.grid")}
        aria-pressed={value === "grid"}
        onClick={() => onChange("grid")}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", value === "list" && "bg-background shadow-sm")}
        aria-label={t("common.view.list")}
        aria-pressed={value === "list"}
        onClick={() => onChange("list")}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
};
