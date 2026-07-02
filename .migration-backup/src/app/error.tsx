"use client";

import { ServiceUnavailable } from "@/components/service-unavailable";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ServiceUnavailable error={error} reset={reset} />;
}
