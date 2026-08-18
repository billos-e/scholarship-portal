"use client";

import { useCallback, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Bell, ChevronDown, ChevronUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  dismissAdminNotification,
  fetchUnreadAdminNotifications,
  type AdminNotification,
  type AdminNotificationKind,
} from "@/lib/api/notifications";
import { getCurrentUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

const QUERY_KEY = ["admin", "notifications"] as const;
const POLL_MS = 45_000;

const KIND_BADGE: Record<
  AdminNotificationKind,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  GPA_UNDER_3: { label: "GPA", variant: "destructive" },
  EMERGENCY_AID: { label: "Aid", variant: "default" },
  DEADLINE_APPROACHING: { label: "Due soon", variant: "secondary" },
  DEADLINE_OVERDUE: { label: "Overdue", variant: "destructive" },
};

function contextLine(item: AdminNotification): string {
  const code = item.studentCode ? ` · ${item.studentCode}` : "";
  return `${item.studentName}${code} · ${item.semesterLabel}`;
}

export function AdminNotificationTray() {
  const user = getCurrentUser();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [openingId, setOpeningId] = useState<string | null>(null);

  const enabled = user?.role === "ADMIN";

  const { data } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchUnreadAdminNotifications,
    enabled,
    refetchInterval: POLL_MS,
    refetchOnWindowFocus: true,
    staleTime: 20_000,
    retry: 1,
  });

  const items = data ?? [];
  const count = items.length;

  const onOpenItem = useCallback(
    async (item: AdminNotification) => {
      setOpeningId(item.id);
      queryClient.setQueryData<AdminNotification[]>(QUERY_KEY, (current) =>
        (current ?? []).filter((row) => row.id !== item.id),
      );
      try {
        await dismissAdminNotification(item.id);
      } catch {
        await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      } finally {
        setOpeningId(null);
      }
      navigate(`/admin/requests/${item.requestId}`);
    },
    [navigate, queryClient],
  );

  if (!enabled || count === 0) return null;

  return (
    <div
      className="pointer-events-none fixed right-4 z-40 max-md:bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-4"
    >
      {expanded ? (
        <Card
          size="sm"
          className="pointer-events-auto w-[min(22.5rem,calc(100vw-2rem))] border-border bg-card shadow-md"
        >
          <CardHeader className="flex flex-row items-center justify-between gap-2 border-b [.border-b]:pb-3">
            <div className="flex min-w-0 items-center gap-2">
              <Bell className="size-4 shrink-0 text-primary" aria-hidden />
              <CardTitle className="text-sm">Notifications</CardTitle>
              <Badge variant="secondary" aria-live="polite">
                {count}
              </Badge>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-expanded={true}
              aria-label="Collapse notifications"
              onClick={() => setExpanded(false)}
            >
              <ChevronDown className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="px-0 pb-1 pt-0">
            <ul className="max-h-72 divide-y divide-border overflow-y-auto">
              {items.map((item) => {
                const badge = KIND_BADGE[item.kind];
                const busy = openingId === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => onOpenItem(item)}
                      className={cn(
                        "flex w-full flex-col gap-0.5 px-3 py-2.5 text-left transition-colors",
                        "hover:bg-muted/80 focus-visible:bg-muted/80",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                        "disabled:opacity-60",
                      )}
                      aria-label={`${item.title}. ${contextLine(item)}. Open payment request.`}
                    >
                      <span className="flex items-center gap-2">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                        <span className="truncate font-heading text-sm font-medium text-foreground">
                          {item.title}
                        </span>
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {contextLine(item)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="pointer-events-auto h-9 gap-2 rounded-xl border-border bg-card px-3 shadow-md"
          aria-expanded={false}
          aria-label={`Show notifications, ${count} unread`}
          onClick={() => setExpanded(true)}
        >
          <Bell className="size-4 text-primary" aria-hidden />
          <span className="font-heading text-sm font-medium">Alerts</span>
          <Badge variant="default" aria-hidden>
            {count}
          </Badge>
          <ChevronUp className="size-3.5 text-muted-foreground" aria-hidden />
        </Button>
      )}
    </div>
  );
}
