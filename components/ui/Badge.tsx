import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "success" | "warning" | "danger";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const tones: Record<Tone, string> = {
  default: "bg-surface-hover text-muted border-border",
  success: "bg-emerald-950 text-emerald-300 border-emerald-800",
  warning: "bg-amber-950 text-amber-300 border-amber-800",
  danger: "bg-red-950 text-red-300 border-red-800",
};

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
