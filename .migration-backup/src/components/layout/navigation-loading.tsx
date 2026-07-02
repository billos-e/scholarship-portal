"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

type NavigationLoadingContextValue = {
  startLoading: () => void;
};

const NavigationLoadingContext =
  createContext<NavigationLoadingContextValue | null>(null);

function NavigationLoadingBar({ active }: { active: boolean }) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden transition-opacity duration-300",
        active ? "opacity-100" : "opacity-0",
      )}
      role="status"
      aria-live="polite"
      aria-busy={active}
      aria-label={active ? "Loading page" : undefined}
    >
      <div className="h-full bg-primary/15">
        <div className="navigation-progress-bar h-full w-1/3 rounded-full bg-primary" />
      </div>
    </div>
  );
}

function NavigationLoadingInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const startLoading = useCallback(() => setLoading(true), []);

  useEffect(() => {
    setLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented) return;
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;

        const next = `${url.pathname}${url.search}`;
        const current = `${pathname}${searchParams.toString() ? `?${searchParams}` : ""}`;
        if (next === current) return;

        setLoading(true);
      } catch {
        // Ignore malformed href values.
      }
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname, searchParams]);

  const value = useMemo(() => ({ startLoading }), [startLoading]);

  return (
    <NavigationLoadingContext.Provider value={value}>
      <NavigationLoadingBar active={loading} />
      <div
        className={cn(
          "min-h-full transition-[filter] duration-300",
          loading && "pointer-events-none blur-[2px]",
        )}
        aria-busy={loading}
      >
        {children}
      </div>
    </NavigationLoadingContext.Provider>
  );
}

export function NavigationLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <NavigationLoadingInner>{children}</NavigationLoadingInner>
    </Suspense>
  );
}

export function useNavigationLoading() {
  const context = useContext(NavigationLoadingContext);
  if (!context) {
    throw new Error(
      "useNavigationLoading must be used within NavigationLoadingProvider",
    );
  }
  return context;
}
