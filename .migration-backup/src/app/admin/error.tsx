"use client";

import { ServiceUnavailable } from "@/components/service-unavailable";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ServiceUnavailable
      error={error}
      reset={reset}
      title="Unable to load admin panel"
    />
  );
}
