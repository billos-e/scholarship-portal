import { useLocation, useSearch, useParams as useWouterParams } from "wouter";

const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

export function useRouter() {
  const [, navigate] = useLocation();
  return {
    push: (href: string) => navigate(href),
    replace: (href: string) => navigate(href, { replace: true }),
    back: () => window.history.back(),
    forward: () => window.history.forward(),
    refresh: () => {},
    prefetch: () => {},
  };
}

export function usePathname(): string {
  const [location] = useLocation();
  return location;
}

export function useSearchParams(): URLSearchParams {
  const search = useSearch();
  return new URLSearchParams(search);
}

export function useParams<T = Record<string, string>>(): T {
  return useWouterParams() as T;
}

export function redirect(href: string): never {
  if (typeof window !== "undefined") {
    window.location.assign(base + (href.startsWith("/") ? href : `/${href}`));
  }
  throw new Error(`NEXT_REDIRECT:${href}`);
}

export const permanentRedirect = redirect;

export function notFound(): never {
  throw new Error("NEXT_NOT_FOUND");
}

export enum RedirectType {
  push = "push",
  replace = "replace",
}
