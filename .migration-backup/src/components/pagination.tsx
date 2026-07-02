import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
  className?: string;
};

export function Pagination({
  currentPage,
  totalPages: pages,
  buildHref,
  className,
}: PaginationProps) {
  if (pages <= 1) return null;

  return (
    <nav
      className={cn("flex items-center justify-between gap-4", className)}
      aria-label="Pagination"
    >
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {pages}
      </p>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage <= 1}
          render={
            currentPage > 1 ? (
              <Link href={buildHref(currentPage - 1)} />
            ) : undefined
          }
        >
          <ChevronLeft />
          Previous
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage >= pages}
          render={
            currentPage < pages ? (
              <Link href={buildHref(currentPage + 1)} />
            ) : undefined
          }
        >
          Next
          <ChevronRight />
        </Button>
      </div>
    </nav>
  );
}
