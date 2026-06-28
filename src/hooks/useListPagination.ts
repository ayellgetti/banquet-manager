import { useEffect, useMemo, useState } from "react";
import { LIST_PAGE_SIZE } from "@/lib/pagination";

type Options = {
  pageSize?: number;
  resetKey?: string | number;
};

export function useListPagination<T>(items: T[], options: Options = {}) {
  const pageSize = options.pageSize ?? LIST_PAGE_SIZE.table;
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [options.resetKey]);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  return {
    page,
    setPage,
    totalPages,
    items: paginatedItems,
    totalItems,
    pageSize,
  };
}
