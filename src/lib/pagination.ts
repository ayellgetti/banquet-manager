export const LIST_PAGE_SIZE = {
  table: 10,
  card: 9,
  booking: 5,
} as const;

export type PageToken = number | "ellipsis";

export const getVisiblePages = (current: number, total: number): PageToken[] => {
  if (total <= 1) return total === 1 ? [1] : [];
  if (total <= 5) return Array.from({ length: total }, (_, index) => index + 1);

  const pages: PageToken[] = [1];

  if (current > 3) pages.push("ellipsis");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let page = start; page <= end; page += 1) pages.push(page);

  if (current < total - 2) pages.push("ellipsis");

  pages.push(total);
  return pages;
};

export const getPageRange = (page: number, pageSize: number, totalItems: number) => {
  if (totalItems === 0) return { start: 0, end: 0 };
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  return { start, end };
};
