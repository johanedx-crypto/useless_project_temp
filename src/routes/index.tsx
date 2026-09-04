import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Gavel, Scale, Skull, Building2, FileText, Film } from "lucide-react";
import { Kicker, Panel } from "@/components/kit";
import { useCaseStore } from "@/lib/case-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Breakup as a Service™ — We break up so you don't have to" },
      {
        name: "description",
        content:
          "Professional relationship termination powered by AI-style roast engines, HR reviews, breakup court and a Malayalam cinematic verdict. Completely unnecessary. Entirely free.",
      },
      { property: "og:title", content: "Breakup as a Service™" },
      {
        property: "og:description",
        content: "Enterprise breakup infrastructure. Zero rupees. All features unlocked.",
      },
    ],
  }),
  component: Landing,
});

const DEPARTMENTS = [
  { icon: Scale, name: "RELATIONSHIP AUDIT", note: "Eleven metrics nobody asked for." },
  { icon: Skull, name: "AI ROAST ENGINE", note: "Five intensities, up to APOCALYPTIC." },
  { icon: Building2, name: "HUMAN RESOURCES", note: "Performance review + official warning." },
  { icon: FileText, name: "TERMINATION & LEGAL", note: "Notice, severance, charges, exhibits." },
  { icon: Gavel, name: "BREAKUP COURT", note: "Prosecution, defense, objections, verdict." },
  { icon: Film, name: "MALAYALAM FINAL HEARING", note: "Original courtroom roast + your clip." },
];

function Landing() {
  const { loadDemo } = useCaseStore();
  const navigate = useNavigate();

  return (
    <main>
      <section
        className="relative flex min-h-[92svh] items-center overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="scanlines pointer-events-none absolute inset-0 opacity-50" aria-hidden />
        <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <Kicker>All features unlocked</Kicker>
          <h1 className="mt-6 font-display text-[clamp(3rem,13vw,9rem)] leading-[0.82]">
            Breakup
            <br />
            <span className="gold-text">as a Service</span>
            <sup className="align-super text-[0.3em] text-accent">™</sup>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-foreground/90 sm:text-2xl">
            “We break up so you don't have to.”
          </p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Professional relationship termination. Powered by AI. Completely unnecessary. Entirely
            free.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/intake"
              className="rounded-md bg-primary px-6 py-3.5 font-mono text-xs uppercase tracking-[0.22em] text-primary-foreground shadow-[var(--shadow-cinematic)] transition-transform hover:-translate-y-0.5"
            >
              Start a breakup
            </Link>
            <button
              onClick={() => {
                loadDemo();
                navigate({ to: "/case" });
              }}
              className="rounded-md border border-accent/60 px-6 py-3.5 font-mono text-xs uppercase tracking-[0.22em] text-accent transition-colors hover:bg-accent/10"
            >
              See a sample case
            </button>
          </div>

          <p className="label-mono mt-8">Enterprise breakup infrastructure. Zero rupees.</p>
        </div>
      </section>

      <section className="border-t border-border/60 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Kicker tone="crimson">Department of unnecessary relationship terminations</Kicker>
          <h2 className="mt-4 max-w-3xl text-3xl sm:text-5xl">
            A single WhatsApp message, escalated through twenty-three departments.
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DEPARTMENTS.map((d) => (
              <Panel key={d.name} className="transition-colors hover:border-accent/60">
                <d.icon className="size-6 text-accent" aria-hidden />
                <h3 className="mt-4 text-lg">{d.name}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{d.note}</p>
              </Panel>
            ))}
          </div>

          <Panel tone="gold" className="mt-10">
            <div className="grid gap-6 sm:grid-cols-3">
              <div>
                <div className="font-display text-4xl text-accent">₹0</div>
                <p className="label-mono mt-1">Total price, forever</p>
              </div>
              <p className="text-sm text-muted-foreground sm:col-span-2">
                No subscription. No premium lock. No Pro plan. No checkout. Your relationship may
                have been expensive — we aren't. Premium emotional damage, free of charge.
              </p>
            </div>
          </Panel>
        </div>
      </section>
    </main>
  );
}
