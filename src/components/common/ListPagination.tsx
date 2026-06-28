import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPageRange, getVisiblePages } from "@/lib/pagination";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

type Props = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export const ListPagination = ({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className,
}: Props) => {
  const { t } = useT();

  if (totalItems === 0) return null;

  const { start, end } = getPageRange(page, pageSize, totalItems);
  const visiblePages = getVisiblePages(page, totalPages);
  const showControls = totalPages > 1;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        {t("common.pagination.showing")
          .replace("{start}", String(start))
          .replace("{end}", String(end))
          .replace("{total}", String(totalItems))}
      </p>

      {showControls && (
        <nav aria-label={t("common.pagination.label")} className="flex items-center gap-1 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label={t("common.pagination.previous")}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{t("common.pagination.previous")}</span>
          </Button>

          <div className="flex items-center gap-1">
            {visiblePages.map((token, index) =>
              token === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="flex h-9 w-9 items-center justify-center text-muted-foreground"
                  aria-hidden
                >
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              ) : (
                <Button
                  key={token}
                  type="button"
                  variant={token === page ? "outline" : "ghost"}
                  size="icon"
                  className="h-9 w-9"
                  aria-current={token === page ? "page" : undefined}
                  onClick={() => onPageChange(token)}
                >
                  {token}
                </Button>
              ),
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label={t("common.pagination.next")}
          >
            <span className="hidden sm:inline">{t("common.pagination.next")}</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </nav>
      )}
    </div>
  );
};
