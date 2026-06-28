/** Returns true when query is empty or any value contains the query (case-insensitive). */
export function matchesListSearch(
  query: string,
  ...values: (string | number | undefined | null)[]
): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return values.some((value) => value != null && String(value).toLowerCase().includes(normalized));
}
