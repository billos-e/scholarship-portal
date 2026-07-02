"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { isDatabaseUnavailable } from "@/lib/db/errors";

type ServiceUnavailableProps = {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
};

export function ServiceUnavailable({
  error,
  reset,
  title = "Service temporarily unavailable",
}: ServiceUnavailableProps) {
  const isDbDown = isDatabaseUnavailable(error);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
        <AlertTriangle className="size-7 text-muted-foreground" />
      </div>
      <h1 className="font-heading text-xl font-bold">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {isDbDown
          ? "We cannot reach the database right now. Your session is still active — please try again in a few minutes."
          : "Something went wrong while loading this page."}
      </p>
      <Button type="button" className="mt-6 gap-2" onClick={reset}>
        <RefreshCw className="size-4" />
        Try again
      </Button>
    </div>
  );
}
