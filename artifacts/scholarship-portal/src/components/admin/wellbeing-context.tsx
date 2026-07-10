import {
  Activity,
  AlertTriangle,
  Brain,
  DollarSign,
  Flame,
  Heart,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { cn } from "@/lib/utils";

const WELLBEING_META: Record<
  string,
  { icon: typeof Heart; tone: "primary" | "accent" | "warning" | "info" | "success" }
> = {
  wellbeingPhysical: { icon: Heart, tone: "primary" },
  wellbeingMental: { icon: Brain, tone: "info" },
  wellbeingFinancial: { icon: DollarSign, tone: "warning" },
  wellbeingStress: { icon: Flame, tone: "accent" },
  wellbeingConfidence: { icon: TrendingUp, tone: "success" },
};

const TONE_RING: Record<string, string> = {
  primary: "text-primary",
  accent: "text-accent",
  warning: "text-warning",
  info: "text-info",
  success: "text-success",
};

const TONE_BG: Record<string, string> = {
  primary: "bg-brand-fuchsia-light",
  accent: "bg-brand-orange-light",
  warning: "bg-warning-light",
  info: "bg-info-light",
  success: "bg-success-light",
};

function ScoreRing({
  value,
  tone,
}: {
  value: number | null;
  tone: keyof typeof TONE_RING;
}) {
  const pct = value !== null ? (value / 5) * 100 : 0;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <svg
      viewBox="0 0 72 72"
      className="size-[72px] shrink-0"
      aria-hidden
    >
      <circle
        cx="36"
        cy="36"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        className="text-muted/40"
      />
      <circle
        cx="36"
        cy="36"
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 36 36)"
        className={TONE_RING[tone]}
      />
      <text
        x="36"
        y="40"
        textAnchor="middle"
        className="fill-foreground text-[15px] font-bold"
        fontSize="15"
        fontWeight="700"
      >
        {value ?? "—"}
      </text>
    </svg>
  );
}

type WellbeingItem = {
  name: string;
  label: string;
  value: number | null;
};

export function WellbeingGrid({ items }: { items: WellbeingItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const meta = WELLBEING_META[item.name] ?? {
          icon: Heart,
          tone: "primary" as const,
        };
        const Icon = meta.icon;

        return (
          <div
            key={item.name}
            className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-4 shadow-sm"
          >
            <ScoreRing value={item.value} tone={meta.tone} />
            <div className="min-w-0 flex-1">
              <div
                className={cn(
                  "mb-1.5 inline-flex size-7 items-center justify-center rounded-md",
                  TONE_BG[meta.tone],
                  TONE_RING[meta.tone],
                )}
              >
                <Icon className="size-3.5" />
              </div>
              <p className="text-sm font-medium leading-snug text-foreground">
                {item.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

type ContextPanelProps = {
  challenges: string[];
  activities: string[];
};

export function ContextPanel({ challenges, activities }: ContextPanelProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-warning/20 bg-gradient-to-br from-warning-light/60 to-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-warning/15 text-warning">
            <AlertTriangle className="size-4" />
          </div>
          <div>
            <p className="font-heading text-sm font-semibold">Challenges</p>
            <p className="text-xs text-muted-foreground">
              Difficulties reported this semester
            </p>
          </div>
        </div>
        {challenges.length > 0 ? (
          <ul className="space-y-2">
            {challenges.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-foreground"
              >
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-warning" />
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">None reported</p>
        )}
      </div>

      <div className="rounded-xl border border-success/20 bg-gradient-to-br from-success-light/50 to-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-success/15 text-success">
            <Activity className="size-4" />
          </div>
          <div>
            <p className="font-heading text-sm font-semibold">Activities</p>
            <p className="text-xs text-muted-foreground">
              Extracurricular involvement
            </p>
          </div>
        </div>
        {activities.length > 0 ? (
          <ul className="space-y-2">
            {activities.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-foreground"
              >
                <Sparkles className="mt-0.5 size-3.5 shrink-0 text-success" />
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">None reported</p>
        )}
      </div>
    </div>
  );
}
