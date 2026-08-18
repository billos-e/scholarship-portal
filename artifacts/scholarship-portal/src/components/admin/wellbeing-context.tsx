import {
  Activity,
  AlertTriangle,
  Brain,
  DollarSign,
  Flame,
  Heart,
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

type ItemListCardProps = {
  title: string;
  description: string;
  items: string[];
  icon: typeof Heart;
  tone: "warning" | "success";
};

const ITEM_TONE = {
  warning: {
    card: "border-warning/20 from-warning-light/60",
    iconWrap: "bg-warning/15 text-warning",
    chip: "border-warning/25 bg-warning-light/80 text-warning-foreground",
  },
  success: {
    card: "border-success/20 from-success-light/50",
    iconWrap: "bg-success/15 text-success",
    chip: "border-success/25 bg-success-light/80 text-success-foreground",
  },
} as const;

function ItemListCard({
  title,
  description,
  items,
  icon: Icon,
  tone,
}: ItemListCardProps) {
  const styles = ITEM_TONE[tone];
  return (
    <div
      className={cn(
        "rounded-xl border bg-gradient-to-br to-card p-5 shadow-sm",
        styles.card,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="flex min-w-0 shrink-0 items-center gap-2.5 sm:max-w-[16rem]">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              styles.iconWrap,
            )}
          >
            <Icon className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="font-heading text-sm font-semibold">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        {items.length > 0 ? (
          <ul className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            {items.map((item) => (
              <li
                key={item}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm font-medium",
                  styles.chip,
                )}
              >
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

type ContextPanelProps = {
  challenges: string[];
};

export function ContextPanel({ challenges }: ContextPanelProps) {
  return (
    <ItemListCard
      title="Challenges"
      description="Difficulties reported this semester"
      items={challenges}
      icon={AlertTriangle}
      tone="warning"
    />
  );
}

type ActivitiesPanelProps = {
  activities: string[];
};

export function ActivitiesPanel({ activities }: ActivitiesPanelProps) {
  return (
    <ItemListCard
      title="Activities"
      description="Extracurricular involvement"
      items={activities}
      icon={Activity}
      tone="success"
    />
  );
}
