import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

type Props = {
  label?: string;
  className?: string;
};

export const DataLoadingState = ({ label, className }: Props) => {
  const { t } = useT();

  return (
    <div className={cn("flex min-h-40 items-center justify-center rounded-xl border border-border/70 bg-card", className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{label ?? t("common.loading")}</span>
      </div>
    </div>
  );
};
