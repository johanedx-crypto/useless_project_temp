import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Grain() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50">
      <div className="grain-overlay absolute inset-0" />
      <div className="scanlines absolute inset-0 opacity-40" />
    </div>
  );
}

export function Kicker({
  children,
  tone = "gold",
}: {
  children: ReactNode;
  tone?: "gold" | "crimson" | "corporate";
}) {
  const tones = {
    gold: "text-accent border-accent/40",
    crimson: "text-primary border-primary/50",
    corporate: "text-[var(--corporate)] border-[var(--corporate)]/40",
  };
  return (
    <span
      className={cn(
        "label-mono inline-flex items-center gap-2 rounded-full border px-3 py-1",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function Panel({
  children,
  className,
  tone,
}: {
  children: ReactNode;
  className?: string;
  tone?: "gold" | "crimson" | "corporate" | "grave";
}) {
  const border = {
    gold: "border-accent/30",
    crimson: "border-primary/40",
    corporate: "border-[var(--corporate)]/40",
    grave: "border-border",
  }[tone ?? "grave"];
  return <div className={cn("glass rounded-lg p-5 sm:p-7", border, className)}>{children}</div>;
}

export function SectionTitle({
  index,
  title,
  sub,
  tone = "gold",
}: {
  index: string;
  title: string;
  sub?: string;
  tone?: "gold" | "crimson" | "corporate";
}) {
  return (
    <header className="mb-6">
      <Kicker tone={tone}>{index}</Kicker>
      <h2 className="mt-3 text-3xl leading-[0.95] sm:text-5xl">{title}</h2>
      {sub ? <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{sub}</p> : null}
    </header>
  );
}

export function Stat({
  label,
  value,
  unit = "%",
  note,
}: {
  label: string;
  value: number;
  unit?: string;
  note: string;
}) {
  const n = useCountUp(value);
  return (
    <div className="rounded-md border border-border bg-card/50 p-4">
      <div className="label-mono">{label}</div>
      <div className="mt-1 flex items-end gap-1 font-display text-4xl text-accent">
        {n}
        <span className="pb-1 text-lg opacity-70">{unit}</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-1000"
          style={{ width: `${Math.min(100, n)}%` }}
        />
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{note}</p>
    </div>
  );
}

export function useCountUp(target: number, ms = 900) {
  const [n, setN] = useState(0);
  const ref = useRef(0);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setN(target);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      ref.current = Math.round(target * (1 - Math.pow(1 - p, 3)));
      setN(ref.current);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return n;
}

export function Stars({ n }: { n: number }) {
  return (
    <span aria-label={`${n} out of 5`} className="text-accent">
      {"★".repeat(n)}
      <span className="opacity-25">{"☆".repeat(Math.max(0, 5 - n))}</span>
    </span>
  );
}

export function Stamp({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("stamp inline-block text-xl sm:text-2xl", className)}>{children}</div>;
}

export function Row({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/60 py-2">
      <span className="label-mono">{k}</span>
      <span className="text-sm text-foreground">{v}</span>
    </div>
  );
}

export function Dialogue({ role, text, mal }: { role: string; text: string; mal?: boolean }) {
  const color =
    role === "PROSECUTION"
      ? "text-primary"
      : role === "DEFENSE"
        ? "text-[var(--corporate)]"
        : "text-accent";
  return (
    <div className="animate-rise border-l-2 border-border/70 pl-4">
      <div className={cn("label-mono", color)}>{role}</div>
      <p className={cn("mt-1 text-base leading-relaxed sm:text-lg", mal && "mal")}>{text}</p>
    </div>
  );
}

/** Reveals children one by one as the user scrolls / after mount. */
export function StageShell({
  id,
  children,
  tone = "default",
}: {
  id: string;
  children: ReactNode;
  tone?: "default" | "corporate" | "court" | "funeral" | "verdict" | "cinema";
}) {
  const bg = {
    default: "bg-background",
    corporate: "bg-[color-mix(in_oklab,var(--corporate)_9%,var(--background))]",
    court: "bg-[color-mix(in_oklab,var(--crimson)_10%,var(--ink))]",
    funeral: "bg-[oklch(0.11_0.004_265)]",
    verdict: "bg-[color-mix(in_oklab,var(--crimson)_16%,var(--ink))]",
    cinema: "bg-[oklch(0.09_0.02_20)]",
  }[tone];
  return (
    <section id={id} className={cn("scroll-mt-20 border-t border-border/50 py-14 sm:py-20", bg)}>
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">{children}</div>
    </section>
  );
}

export function Ticker({ lines }: { lines: string[] }) {
  return (
    <ul className="space-y-1 font-mono text-xs text-muted-foreground sm:text-sm">
      {lines.map((l) => (
        <li key={l} className="animate-rise">
          <span className="text-accent">›</span> {l}
        </li>
      ))}
    </ul>
  );
}
