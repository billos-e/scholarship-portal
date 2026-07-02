"use client";

import { useCallback, useMemo, useState } from "react";

import {
  sortItems,
  toggleSort,
  type SortDirection,
  type SortState,
} from "@/lib/table-sort";

export function useTableSort<T, K extends string>(
  items: T[],
  accessors: Record<K, (item: T) => unknown>,
  defaultSort?: SortState<K>,
) {
  const [sort, setSort] = useState<SortState<K>>(
    () => defaultSort ?? { key: null, direction: "asc" },
  );

  const sortedItems = useMemo(
    () => sortItems(items, sort, accessors),
    [items, sort, accessors],
  );

  const onSort = useCallback((key: K) => {
    setSort((current) => toggleSort(current, key));
  }, []);

  return {
    sortedItems,
    sortKey: sort.key,
    sortDirection: sort.direction as SortDirection,
    onSort,
  };
}
