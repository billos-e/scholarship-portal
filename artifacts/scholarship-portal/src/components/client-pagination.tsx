"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ClientPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function ClientPagination({
  currentPage,
  totalPages: pages,
  onPageChange,
  className,
}: ClientPaginationProps) {
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
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft />
          Previous
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage >= pages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
          <ChevronRight />
        </Button>
      </div>
    </nav>
  );
}
