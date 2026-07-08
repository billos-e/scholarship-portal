"use client";

import { useCallback, useMemo } from "react";

type Draft = Record<string, string>;

function readDraft(key: string): Draft {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Draft) : {};
  } catch {
    return {};
  }
}

function patchDraft(key: string, patch: Draft) {
  try {
    localStorage.setItem(key, JSON.stringify({ ...readDraft(key), ...patch }));
  } catch {}
}

export function useFormDraft(storageKey: string) {
  // Keep initial for backward-compat (step restore on first mount).
  // get() reads fresh from storage so remounted steps always see latest values.
  const _initial = useMemo(() => readDraft(storageKey), [storageKey]);
  void _initial;

  const get = useCallback(
    (name: string, fallback = "") => readDraft(storageKey)[name] ?? fallback,
    [storageKey],
  );

  const save = useCallback(
    (patch: Draft) => patchDraft(storageKey, patch),
    [storageKey],
  );

  const onFormChange = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      try {
        const fd = new FormData(e.currentTarget);
        const counts: Record<string, number> = {};
        const values: Draft = {};
        for (const [k, v] of fd.entries()) {
          if (typeof v === "string") {
            counts[k] = (counts[k] ?? 0) + 1;
            values[k] = v;
          }
        }
        const single: Draft = {};
        for (const [k, v] of Object.entries(values)) {
          if (counts[k] === 1) single[k] = v;
        }
        patchDraft(storageKey, single);
      } catch {}
    },
    [storageKey],
  );

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {}
  }, [storageKey]);

  return { get, save, onFormChange, clearDraft };
}
