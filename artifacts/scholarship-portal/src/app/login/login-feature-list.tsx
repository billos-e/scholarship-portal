"use client";

import { FileText, History, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: FileText,
    title: "Payment requests",
    description: "Submit tuition payment requests easily",
  },
  {
    icon: History,
    title: "Track your progress",
    description: "Follow status from submission to payment",
  },
  {
    icon: ShieldCheck,
    title: "Secure access",
    description: "Your documents and details stay protected",
  },
];

const DISPLAY_MS = 3400;
const TRANSITION_MS = 500;

type Phase = "enter" | "visible" | "exit";

export function LoginFeatureList() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("enter");
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (phase === "enter") {
      setShow(false);
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setShow(true));
      });
      const timer = window.setTimeout(() => setPhase("visible"), TRANSITION_MS);
      return () => {
        cancelAnimationFrame(frame);
        clearTimeout(timer);
      };
    }
    return undefined;
  }, [phase, activeIndex]);

  useEffect(() => {
    if (phase !== "visible") return;

    const timer = window.setTimeout(() => setPhase("exit"), DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [phase, activeIndex]);

  useEffect(() => {
    if (phase !== "exit") return;

    setShow(false);
    const timer = window.setTimeout(() => {
      setActiveIndex((i) => (i + 1) % FEATURES.length);
      setPhase("enter");
    }, TRANSITION_MS);

    return () => clearTimeout(timer);
  }, [phase]);

  const feature = FEATURES[activeIndex];
  const Icon = feature.icon;

  return (
    <div className="max-w-md" aria-live="polite" aria-atomic="true">
      <ul className="relative h-[4.75rem]">
        <li
          key={activeIndex}
          className={cn(
            "absolute inset-x-0 top-0 flex items-center gap-3.5 rounded-xl border border-white/10 bg-black/30 p-4 backdrop-blur-md transition-all duration-500 ease-out",
            show
              ? "translate-y-0 opacity-100"
              : phase === "exit"
                ? "-translate-y-2 opacity-0"
                : "translate-y-4 opacity-0",
          )}
        >
          <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/10">
            <span
              aria-hidden
              className={cn(
                "absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700",
                show && "translate-x-full",
              )}
            />
            <Icon className="relative size-[18px]" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold tracking-wide">
              {feature.title}
            </p>
            <p className="text-[11px] leading-relaxed text-white/65">
              {feature.description}
            </p>
          </div>
        </li>
      </ul>

      <div className="mt-4 flex gap-1.5" aria-hidden>
        {FEATURES.map((item, index) => (
          <span
            key={item.title}
            className={cn(
              "h-1 rounded-full transition-all duration-500",
              index === activeIndex
                ? "w-6 bg-white/80"
                : "w-1.5 bg-white/25",
            )}
          />
        ))}
      </div>
    </div>
  );
}
