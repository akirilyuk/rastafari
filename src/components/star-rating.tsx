"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  onChange,
  size = "md",
  readOnly = false,
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: "sm" | "md";
  readOnly?: boolean;
}) {
  const px = size === "sm" ? "size-3.5" : "size-5";
  return (
    <div className="inline-flex items-center gap-0.5" role={readOnly ? "img" : "radiogroup"}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        return (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            onClick={() => onChange?.(n)}
            className={cn(
              "rounded-sm text-gold transition",
              !readOnly && "hover:scale-110",
              readOnly && "cursor-default",
            )}
          >
            <Star
              className={cn(px, filled ? "fill-gold text-gold" : "text-muted-foreground/40")}
            />
          </button>
        );
      })}
    </div>
  );
}

export function ScoreLabel({ value, count }: { value: number; count?: number }) {
  if (!count) return <span className="text-muted-foreground">No reviews yet</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <Star className="size-3.5 fill-gold text-gold" />
      <span className="font-medium tabular-nums">{value.toFixed(1)}</span>
      <span className="text-muted-foreground">({count})</span>
    </span>
  );
}
