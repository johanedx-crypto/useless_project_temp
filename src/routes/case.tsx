import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialogue,
  Kicker,
  Panel,
  Row,
  SectionTitle,
  Stamp,
  Stars,
  Stat,
  StageShell,
  Ticker,
} from "@/components/kit";
import { FinalMediaModal, MediaLibrary, selectFinalMedia } from "@/components/final-media";
import { useCaseStore } from "@/lib/case-store";
import { generateExitInterviewAnalysis, analyzeRelationship } from "@/lib/engine";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/case")({
  head: () => ({
    meta: [
      { title: "Case File — Breakup as a Service™" },
      {
        name: "description",
        content:
          "Your relationship termination case file: audit, roast report, HR review, breakup court, verdict, funeral, receipt and the Malayalam final hearing. Free, always.",
      },
      { property: "og:title", content: "Case File — Breakup as a Service™" },
      {
        property: "og:description",
        content: "Enterprise-level breakup proceedings. Zero rupees.",
      },
    ],
  }),
  component: CasePage,
});

const EXIT_QUESTIONS = [
  "Would you re-hire this person?",
  "Rate your emotional compensation package.",
  "Did management (them) listen to feedback?",
  "Would you recommend this relationship to a friend?",
  "How is your recovery going, honestly?",
];

const EXIT_OPTIONS = [
  "ABSOLUTELY NOT",
  "NO, AND HOW DARE YOU ASK",
  "ONLY IF I LOSE MY MEMORY",
  "I'M STILL DELUSIONAL",
];

const STAGES = [
  { id: "processing", label: "Processing" },
  { id: "audit", label: "Audit" },
  { id: "roast", label: "Roast report" },
  { id: "hr", label: "HR review" },
  { id: "warning", label: "Warning" },
  { id: "termination", label: "Termination" },
  { id: "exit", label: "Exit interview" },
  { id: "charges", label: "Charges" },
  { id: "prosecution", label: "Prosecution" },
  { id: "defense", label: "Defense" },
  { id: "judge", label: "Judge" },
  { id: "verdict", label: "Verdict" },
  { id: "sentence", label: "Sentence" },
  { id: "autopsy", label: "Autopsy" },
  { id: "funeral", label: "Funeral" },
  { id: "receipt", label: "Receipt" },
  { id: "damage", label: "Damage" },
  { id: "recovery", label: "Recovery" },
  { id: "certificate", label: "Certificate" },
  { id: "finalroast", label: "Final roast" },
  { id: "malayalam", label: "Malayalam hearing" },
  { id: "judgment", label: "Final judgment" },
  { id: "media", label: "Media locker" },
  { id: "closed", label: "Case closed" },
] as const;

const rupee = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function CasePage() {
  const { breakupCase, isDemo, media, exitAnswers, setExitAnswer, resetCase } = useCaseStore();
  const navigate = useNavigate();
  const [stage, setStage] = useState(0);
  const [booting, setBooting] = useState(true);
  const [blackout, setBlackout] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!breakupCase) return;
    const t = setTimeout(() => setBooting(false), 1600);
    return () => clearTimeout(t);
  }, [breakupCase]);

  const advance = useCallback(() => {
    setStage((s) => {
      const next = Math.min(STAGES.length - 1, s + 1);
      requestAnimationFrame(() => {
        document.getElementById(STAGES[next]!.id)?.scrollIntoView({ behavior: "smooth" });
      });
      return next;
    });
  }, []);

  const finalItem = useMemo(
    () => (breakupCase ? selectFinalMedia(media, breakupCase.mediaMood) : null),
    [media, breakupCase],
  );

  const runFinale = useCallback(() => {
    setBlackout(true);
    setTimeout(() => {
      setBlackout(false);
      if (finalItem) setShowVideo(true);
      else setStage(STAGES.length - 1);
    }, 2200);
  }, [finalItem]);

  const copy = useCallback((key: string, text: string) => {
    void navigator.clipboard?.writeText(text).then(
      () => {
        setCopied(key);
        setTimeout(() => setCopied(null), 1800);
      },
      () => setCopied("fail"),
    );
  }, []);

  if (!hydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="label-mono animate-flicker">Opening case file…</p>
      </main>
    );
  }

  if (!breakupCase) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 text-center">
        <Kicker tone="crimson">No active case</Kicker>
        <h1 className="mt-4 text-4xl sm:text-5xl">The court has nothing on file</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          File an intake form and the Department will begin proceedings immediately. Free of charge,
          as always.
        </p>
        <Link
          to="/intake"
          className="mt-8 rounded-md bg-primary px-6 py-3 font-mono text-xs uppercase tracking-[0.24em] text-primary-foreground"
        >
          File a case
        </Link>
      </main>
    );
  }

  const c = breakupCase;
  const ctx = analyzeRelationship(c.intake);
  const reached = (i: number) => stage >= i;
  const shareVerdict = `BREAKUP AS A SERVICE™ — CASE ${c.caseNumber}
VERDICT: ${c.verdict.verdict}
EMOTIONAL DAMAGE: ${c.verdict.emotionalDamage}%
${c.finalRoast[0] ?? ""}
Filed free of charge. Zero rupees.`;
  const shareReceipt = `RELATIONSHIP RECEIPT — CASE ${c.caseNumber}
${c.receipt.lines.map((l) => `${l.item} x${l.qty} — ${rupee(l.amount)}`).join("\n")}
TOTAL EMOTIONAL COST: ${rupee(c.receipt.total)}
Reason: ${c.receipt.reason}`;

  const Next = ({ index, label }: { index: number; label: string }) =>
    stage === index ? (
      <div className="mt-8">
        <button
          onClick={advance}
          className="rounded-md bg-primary px-6 py-3 font-mono text-xs uppercase tracking-[0.24em] text-primary-foreground shadow-[var(--shadow-cinematic)] transition-transform hover:-translate-y-0.5"
        >
          {label}
        </button>
      </div>
    ) : null;

  return (
    <main className="relative">
      {/* sticky case header */}
      <div className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 sm:px-6">
          <Link to="/" className="label-mono transition-colors hover:text-accent">
            ← BaaS
          </Link>
          <span className="label-mono text-accent">CASE {c.caseNumber}</span>
          <span className="label-mono">
            {c.intake.userName || "Client"} v. {c.intake.partnerName || "Respondent"}
          </span>
          <span className="label-mono text-primary">{c.intake.roastLevel}</span>
          {isDemo ? <span className="label-mono">DEMO FILE</span> : null}
          <span className="ml-auto label-mono">
            {STAGES[stage]!.label} · {stage + 1}/{STAGES.length}
          </span>
        </div>
        <div className="h-0.5 w-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${((stage + 1) / STAGES.length) * 100}%` }}
          />
        </div>
      </div>

      {/* 0. processing */}
      <StageShell id="processing" tone="corporate">
        <SectionTitle
          index="STAGE 00 · INTAKE RECEIVED"
          title="Processing your relationship"
          sub="Please remain emotionally seated. Do not text them while we work."
          tone="corporate"
        />
        <Panel tone="corporate">
          <Ticker
            lines={[
              `Case ${c.caseNumber} opened at ${new Date(c.createdAt).toLocaleString()}`,
              `Scanning ${c.intake.duration || "an unspecified era"} of ${c.intake.relationshipType || "unclassified relationship structure"}…`,
              `Indexing red flag: "${c.intake.redFlag || "undeclared"}"`,
              `Measuring reply latency: ${c.intake.replyTime || "eventually"}`,
              `Roast level ${c.intake.roastLevel} authorised. Drama level ${c.intake.dramaLevel} loaded.`,
              booting ? "Compiling disrespect…" : "Case file ready. All departments notified.",
            ]}
          />
        </Panel>
        {booting ? (
          <p className="mt-6 label-mono animate-flicker text-accent">Processing…</p>
        ) : (
          <Next index={0} label="Open the audit" />
        )}
      </StageShell>

      {/* 1. audit */}
      {reached(1) && (
        <StageShell id="audit" tone="corporate">
          <SectionTitle
            index="STAGE 01 · RELATIONSHIP AUDIT"
            title="Quarterly relationship audit"
            sub="Findings of the Department of Unnecessary Relationship Terminations."
            tone="corporate"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {c.metrics.map((m) => (
              <Stat
                key={m.label}
                label={m.label}
                value={m.value}
                unit={m.unit ?? "%"}
                note={m.note}
              />
            ))}
          </div>
          <Next index={1} label="Release the roast report" />
        </StageShell>
      )}

      {/* 2. roast report */}
      {reached(2) && (
        <StageShell id="roast" tone="default">
          <SectionTitle
            index="STAGE 02 · ROAST REPORT"
            title="Official roast report"
            sub={`Intensity: ${c.intake.roastLevel}. This document was reviewed by nobody.`}
            tone="crimson"
          />
          <div className="space-y-4">
            {c.roastReport.map((l) => (
              <Panel key={l.label} tone="crimson">
                <div className="label-mono text-primary">{l.label}</div>
                <p className="mt-2 text-base leading-relaxed sm:text-lg">{l.text}</p>
              </Panel>
            ))}
          </div>
          <Next index={2} label="Send to HR" />
        </StageShell>
      )}

      {/* 3. HR review */}
      {reached(3) && (
        <StageShell id="hr" tone="corporate">
          <SectionTitle
            index="STAGE 03 · HR PERFORMANCE REVIEW"
            title={`Performance review: ${c.intake.partnerName || "Respondent"}`}
            sub="Conducted without their knowledge, as is tradition."
            tone="corporate"
          />
          <Panel tone="corporate" className="space-y-3">
            {c.hrReport.metrics.map((m) => (
              <div key={m.label} className="border-b border-border/60 pb-3 last:border-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="label-mono">{m.label}</span>
                  <Stars n={m.stars} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{m.note}</p>
              </div>
            ))}
            <Row
              k="EMPLOYMENT STATUS"
              v={<span className="text-primary">{c.hrReport.status}</span>}
            />
            <p className="text-sm leading-relaxed">{c.hrReport.summary}</p>
          </Panel>
          <Next index={3} label="Issue final warning" />
        </StageShell>
      )}

      {/* 4. warning */}
      {reached(4) && (
        <StageShell id="warning" tone="corporate">
          <SectionTitle
            index="STAGE 04 · FINAL WARNING"
            title="Final written warning"
            sub="Copies filed with the court, your group chat, and your diary."
            tone="crimson"
          />
          <Panel tone="crimson">
            <div className="label-mono">POLICY VIOLATIONS</div>
            <ul className="mt-3 space-y-2 text-sm">
              {c.warning.violations.map((v) => (
                <li key={v} className="flex gap-2">
                  <span className="text-primary">✕</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-border/60 pt-4 text-sm text-muted-foreground">
              {c.warning.finalWarning}
            </p>
          </Panel>
          <Next index={4} label="Proceed to termination" />
        </StageShell>
      )}

      {/* 5. termination */}
      {reached(5) && (
        <StageShell id="termination" tone="corporate">
          <SectionTitle
            index="STAGE 05 · TERMINATION NOTICE"
            title="Notice of relationship termination"
            tone="crimson"
          />
          <Panel tone="crimson" className="space-y-4">
            {c.termination.body.map((p, i) => (
              <p key={i} className="text-sm leading-relaxed sm:text-base">
                {p}
              </p>
            ))}
            <div className="rounded-md border border-border bg-card/50 p-4">
              <div className="label-mono">SEVERANCE PACKAGE</div>
              <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                {c.termination.severance.map((s) => (
                  <li key={s}>· {s}</li>
                ))}
              </ul>
            </div>
            <Stamp className="text-primary">TERMINATED</Stamp>
          </Panel>
          <Next index={5} label="Begin exit interview" />
        </StageShell>
      )}

      {/* 6. exit interview */}
      {reached(6) && (
        <StageShell id="exit" tone="corporate">
          <SectionTitle
            index="STAGE 06 · EXIT INTERVIEW"
            title="Mandatory exit interview"
            sub="Answer honestly. HR can tell when you are lying to yourself."
            tone="corporate"
          />
          <Panel className="space-y-6">
            {EXIT_QUESTIONS.map((q) => (
              <div key={q}>
                <span className="label-mono">{q}</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {EXIT_OPTIONS.map((o) => (
                    <button
                      key={o}
                      type="button"
                      aria-pressed={exitAnswers[q] === o}
                      onClick={() => setExitAnswer(q, o)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors",
                        exitAnswers[q] === o
                          ? "border-accent bg-accent/20 text-foreground"
                          : "border-border text-muted-foreground hover:border-accent/60",
                      )}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </Panel>
          {Object.keys(exitAnswers).length ? (
            <Panel tone="corporate" className="mt-4 space-y-2">
              {generateExitInterviewAnalysis(ctx, exitAnswers).map((l, i) => (
                <p key={i} className="text-sm leading-relaxed">
                  {l}
                </p>
              ))}
            </Panel>
          ) : null}
          <Next index={6} label="Escalate to court" />
        </StageShell>
      )}

      {/* 7. charges */}
      {reached(7) && (
        <StageShell id="charges" tone="court">
          <SectionTitle
            index="STAGE 07 · BREAKUP COURT"
            title="The court is now in session"
            sub={`In the matter of ${c.intake.userName || "Client"} v. ${c.intake.partnerName || "Respondent"}. All rise. Nobody rose.`}
            tone="crimson"
          />
          <div className="space-y-3">
            {c.charges.map((ch) => (
              <Panel key={ch.count} tone="crimson">
                <div className="label-mono text-primary">{ch.count}</div>
                <h3 className="mt-1 font-display text-2xl">{ch.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{ch.detail}</p>
              </Panel>
            ))}
          </div>
          <Next index={7} label="Call the prosecution" />
        </StageShell>
      )}

      {/* 8. prosecution */}
      {reached(8) && (
        <StageShell id="prosecution" tone="court">
          <SectionTitle index="STAGE 08 · PROSECUTION" title="Opening statement" tone="crimson" />
          <Panel tone="crimson">
            <Dialogue role="PROSECUTION" text={c.prosecution.opening} />
          </Panel>
          <h3 className="mt-8 font-display text-2xl">Exhibits</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {c.prosecution.exhibits.map((e) => (
              <Panel key={e.id}>
                <div className="label-mono text-accent">{e.id}</div>
                <div className="mt-1 font-display text-lg">{e.title}</div>
                <p className="mt-2 text-sm text-muted-foreground">{e.roast}</p>
              </Panel>
            ))}
          </div>
          {c.intake.evidenceNames?.length ? (
            <p className="mt-4 text-xs text-muted-foreground">
              Client-submitted exhibits on record: {c.intake.evidenceNames.join(", ")}
            </p>
          ) : null}
          <Next index={8} label="Hear the defense" />
        </StageShell>
      )}

      {/* 9. defense + objections */}
      {reached(9) && (
        <StageShell id="defense" tone="court">
          <SectionTitle
            index="STAGE 09 · DEFENSE"
            title="The defense attempts something"
            tone="corporate"
          />
          <Panel tone="corporate" className="space-y-5">
            {c.defense.map((d, i) => (
              <Dialogue key={i} role={d.role} text={d.text} />
            ))}
          </Panel>
          <div className="mt-6 space-y-2">
            {c.objections.map((o, i) => (
              <Panel key={i} tone="crimson">
                <div className="label-mono text-primary">OBJECTION {i + 1}</div>
                <p className="mt-1 text-sm sm:text-base">{o}</p>
              </Panel>
            ))}
          </div>
          <Next index={9} label="Judge's remarks" />
        </StageShell>
      )}

      {/* 10. judge */}
      {reached(10) && (
        <StageShell id="judge" tone="court">
          <SectionTitle
            index="STAGE 10 · THE BENCH"
            title="The judge has heard enough"
            tone="gold"
          />
          <Panel tone="gold" className="space-y-4">
            <Dialogue
              role="JUDGE"
              text={`This court has reviewed ${c.intake.duration || "an unspecified era"} of evidence, including the phrase "${c.intake.saysNothing || "nothing"}" deployed as a weapon. The bench notes that ${c.intake.partnerName || "the respondent"} replied in ${c.intake.replyTime || "geological time"} and still expected a warm reception.`}
            />
            <Dialogue
              role="COURT"
              text="The court will now deliver a verdict. Members of the group chat, please stop screenshotting."
            />
          </Panel>
          <Next index={10} label="Deliver the verdict" />
        </StageShell>
      )}

      {/* 11. verdict */}
      {reached(11) && (
        <StageShell id="verdict" tone="verdict">
          <SectionTitle index="STAGE 11 · VERDICT" title="Judgment of the court" tone="crimson" />
          <Panel tone="crimson" className="text-center">
            <div className="label-mono">THE COURT FINDS THE RESPONDENT</div>
            <h3 className="mt-3 animate-rise font-display text-4xl leading-none text-primary sm:text-6xl">
              {c.verdict.verdict}
            </h3>
            <div className="mx-auto mt-6 max-w-2xl text-left">
              <Row k="CAUSE" v="" />
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {c.verdict.cause}
              </p>
            </div>
            <div className="mt-6">
              <Stat
                label="EMOTIONAL DAMAGE"
                value={c.verdict.emotionalDamage}
                note="Certified by the bench. Non-refundable."
              />
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => copy("verdict", shareVerdict)}
                className="rounded-md border border-accent/60 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-accent"
              >
                {copied === "verdict" ? "Copied verdict card" : "Copy verdict card"}
              </button>
            </div>
          </Panel>
          <Next index={11} label="Read the sentence" />
        </StageShell>
      )}

      {/* 12. sentence */}
      {reached(12) && (
        <StageShell id="sentence" tone="verdict">
          <SectionTitle index="STAGE 12 · SENTENCING" title="Sentence" tone="crimson" />
          <Panel tone="crimson">
            <ol className="space-y-3 text-sm sm:text-base">
              {c.sentence.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="label-mono text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </Panel>
          <Next index={12} label="Perform the autopsy" />
        </StageShell>
      )}

      {/* 13. autopsy */}
      {reached(13) && (
        <StageShell id="autopsy" tone="funeral">
          <SectionTitle
            index="STAGE 13 · POST-MORTEM"
            title="Relationship autopsy"
            sub="Conducted by the Forensic Feelings Unit."
            tone="gold"
          />
          <Panel>
            <Row k="CAUSE OF DEATH" v={c.autopsy.causeOfDeath} />
            <Row k="TIME OF DEATH" v={c.autopsy.timeOfDeath} />
            <Row k="LAST WORDS" v={<span className="italic">"{c.autopsy.lastWords}"</span>} />
            <div className="mt-4">
              <div className="label-mono">CONTRIBUTING FACTORS</div>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {c.autopsy.factors.map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
            </div>
          </Panel>
          <Next index={13} label="Proceed to the funeral" />
        </StageShell>
      )}

      {/* 14. funeral */}
      {reached(14) && (
        <StageShell id="funeral" tone="funeral">
          <SectionTitle index="STAGE 14 · FUNERAL" title="In loving memory" tone="gold" />
          <Panel className="text-center">
            <div className="label-mono">HERE LIES</div>
            <h3 className="mt-2 font-display text-3xl sm:text-5xl">
              {c.intake.userName || "Client"} &amp; {c.intake.partnerName || "Respondent"}
            </h3>
            <div className="label-mono mt-2 text-accent">{c.funeral.years}</div>
            <div className="mx-auto mt-6 max-w-xl space-y-2 text-left text-sm text-muted-foreground">
              {c.funeral.eulogy.map((e) => (
                <p key={e}>{e}</p>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {c.funeral.causes.map((x) => (
                <span
                  key={x}
                  className="rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                >
                  {x}
                </span>
              ))}
            </div>
          </Panel>
          <Next index={14} label="Print the receipt" />
        </StageShell>
      )}

      {/* 15. receipt */}
      {reached(15) && (
        <StageShell id="receipt" tone="default">
          <SectionTitle
            index="STAGE 15 · BILLING"
            title="Relationship receipt"
            sub="Your relationship may have been expensive. We aren't."
            tone="gold"
          />
          <Panel className="font-mono text-sm">
            <div className="label-mono text-center">
              BREAKUP AS A SERVICE™ · CASE {c.caseNumber}
            </div>
            <div className="mt-4 space-y-1">
              {c.receipt.lines.map((l) => (
                <div
                  key={l.item}
                  className="flex justify-between gap-4 border-b border-border/40 py-1"
                >
                  <span>
                    {l.item} <span className="text-muted-foreground">x{l.qty}</span>
                  </span>
                  <span>{rupee(l.amount)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t border-accent/40 pt-3 text-base">
              <span className="text-accent">TOTAL EMOTIONAL COST</span>
              <span className="text-accent">{rupee(c.receipt.total)}</span>
            </div>
            <div className="mt-3 flex justify-between text-base">
              <span>AMOUNT CHARGED BY US</span>
              <span className="text-accent">₹0</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{c.receipt.reason} Refund denied.</p>
            <button
              onClick={() => copy("receipt", shareReceipt)}
              className="mt-4 rounded-md border border-accent/60 px-4 py-2 text-[10px] uppercase tracking-widest text-accent"
            >
              {copied === "receipt" ? "Copied receipt" : "Copy receipt"}
            </button>
          </Panel>
          <Next index={15} label="Assess the damage" />
        </StageShell>
      )}

      {/* 16. damage */}
      {reached(16) && (
        <StageShell id="damage" tone="default">
          <SectionTitle
            index="STAGE 16 · DAMAGE REPORT"
            title="Emotional damage report"
            tone="crimson"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {c.damage.map((d) => (
              <Stat
                key={d.label}
                label={d.label}
                value={d.value}
                unit={d.unit ?? "%"}
                note={d.note}
              />
            ))}
          </div>
          <Next index={16} label="Show the recovery plan" />
        </StageShell>
      )}

      {/* 17. recovery */}
      {reached(17) && (
        <StageShell id="recovery" tone="default">
          <SectionTitle
            index="STAGE 17 · RECOVERY"
            title="Court-mandated recovery timeline"
            sub="Progress is measured in messages not sent."
            tone="gold"
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {c.recovery.map((d) => (
              <Panel key={d.day}>
                <div className="label-mono text-accent">{d.day}</div>
                <div className="mt-3 space-y-1 text-xs">
                  <Row k="STALK CHECKS" v={d.stalking} />
                  <Row k='TYPED "HEY"' v={d.typedHey} />
                  <Row k="ACTUALLY SENT" v={d.sent} />
                  <Row k="STABILITY" v={`${d.stability}%`} />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{d.note}</p>
              </Panel>
            ))}
          </div>
          <Next index={17} label="Issue the certificate" />
        </StageShell>
      )}

      {/* 18. certificate */}
      {reached(18) && (
        <StageShell id="certificate" tone="default">
          <SectionTitle
            index="STAGE 18 · CERTIFICATE"
            title="Certificate of termination"
            tone="gold"
          />
          <Panel tone="gold" className="text-center">
            <div className="label-mono">DEPARTMENT OF UNNECESSARY RELATIONSHIP TERMINATIONS</div>
            <h3 className="gold-text mt-4 font-display text-3xl sm:text-5xl">
              CERTIFICATE OF RELATIONSHIP TERMINATION
            </h3>
            <p className="mt-4 text-sm text-muted-foreground">
              This certifies that the relationship between{" "}
              <span className="text-foreground">{c.intake.userName || "Client"}</span> and{" "}
              <span className="text-foreground">{c.intake.partnerName || "Respondent"}</span> has
              been formally, permanently and enthusiastically terminated.
            </p>
            <p className="mx-auto mt-4 max-w-xl text-sm">{c.certificate.reason}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
              <Stamp className="text-primary">CASE CLOSED</Stamp>
              <div className="label-mono">CASE {c.caseNumber}</div>
              <div className="label-mono">FEE PAID: ₹0</div>
            </div>
          </Panel>
          <Next index={18} label="Final roast" />
        </StageShell>
      )}

      {/* 19. final roast */}
      {reached(19) && (
        <StageShell id="finalroast" tone="cinema">
          <SectionTitle index="STAGE 19 · CLOSING ROAST" title="Closing remarks" tone="crimson" />
          <div className="space-y-4">
            {c.finalRoast.map((l, i) => (
              <p key={i} className="animate-rise text-lg leading-relaxed sm:text-2xl">
                {l}
              </p>
            ))}
          </div>
          <Next index={19} label={`Begin the ${c.intake.hearingLanguage} hearing`} />
        </StageShell>
      )}

      {/* 20. malayalam hearing */}
      {reached(20) && (
        <StageShell id="malayalam" tone="cinema">
          <SectionTitle
            index="STAGE 20 · FINAL HEARING"
            title={
              c.intake.hearingLanguage === "MALAYALAM"
                ? "അന്തിമ വിചാരണ"
                : "Final Hearing (Manglish)"
            }
            sub="Drama level: MAXIMUM. Background music assumed."
            tone="gold"
          />
          <Panel tone="gold" className="space-y-5">
            {c.malayalamHearing.length ? (
              c.malayalamHearing.map((l, i) => (
                <Dialogue
                  key={i}
                  role={l.role}
                  text={l.text}
                  mal={c.intake.hearingLanguage === "MALAYALAM"}
                />
              ))
            ) : (
              <Dialogue
                role="COURT"
                text="The final hearing transcript is unavailable. The court proceeds in English: you were the only one trying, and the court is tired on your behalf."
              />
            )}
          </Panel>
          <Next index={20} label="Final judgment" />
        </StageShell>
      )}

      {/* 21. malayalam judgment */}
      {reached(21) && (
        <StageShell id="judgment" tone="verdict">
          <SectionTitle
            index="STAGE 21 · FINAL JUDGMENT"
            title="വിധി · The judgment"
            tone="crimson"
          />
          <Panel tone="crimson" className="space-y-4">
            <p
              className={cn(
                "text-base sm:text-lg",
                c.intake.hearingLanguage === "MALAYALAM" && "mal",
              )}
            >
              {c.malayalamJudgment.intro}
            </p>
            <h3
              className={cn(
                "font-display text-3xl text-primary sm:text-5xl",
                c.intake.hearingLanguage === "MALAYALAM" && "mal",
              )}
            >
              {c.malayalamJudgment.verdict}
            </h3>
            <p
              className={cn(
                "text-base sm:text-lg",
                c.intake.hearingLanguage === "MALAYALAM" && "mal",
              )}
            >
              {c.malayalamJudgment.sentence}
            </p>
            <p
              className={cn(
                "border-t border-border/60 pt-4 text-lg text-accent sm:text-2xl",
                c.intake.hearingLanguage === "MALAYALAM" && "mal",
              )}
            >
              {c.malayalamJudgment.punchline}
            </p>
          </Panel>
          <Next index={21} label="Open the media locker" />
        </StageShell>
      )}

      {/* 22. media locker */}
      {reached(22) && (
        <StageShell id="media" tone="cinema">
          <SectionTitle
            index="STAGE 22 · MEDIA EVIDENCE"
            title="Final verdict media locker"
            sub={`Court mood for this case: ${c.mediaMood.join(" · ")}. Add clips, tag them, and the court picks one at random for the finale.`}
            tone="gold"
          />
          <MediaLibrary />
          {stage === 22 ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={runFinale}
                className="rounded-md bg-primary px-6 py-3 font-mono text-xs uppercase tracking-[0.24em] text-primary-foreground shadow-[var(--shadow-cinematic)]"
              >
                {finalItem ? "Roll the final verdict" : "Close the case"}
              </button>
              {!finalItem ? (
                <p className="self-center text-xs text-muted-foreground">
                  No tagged clip yet — the case closes without the cinematic ending.
                </p>
              ) : null}
            </div>
          ) : null}
        </StageShell>
      )}

      {/* 23. case closed */}
      {reached(23) && (
        <StageShell id="closed" tone="verdict">
          <div className="py-10 text-center">
            <Kicker tone="crimson">Case {c.caseNumber}</Kicker>
            <h2 className="mt-4 font-display text-5xl leading-none sm:text-7xl">CASE CLOSED</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Enterprise-level breakup. Zero rupees. Premium emotional damage, free of charge.
            </p>
            <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
              <Panel tone="crimson">
                <div className="label-mono">SHARE CARD · VERDICT</div>
                <pre className="mt-2 whitespace-pre-wrap font-mono text-xs">{shareVerdict}</pre>
                <button
                  onClick={() => copy("v2", shareVerdict)}
                  className="mt-3 rounded-md border border-accent/60 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-accent"
                >
                  {copied === "v2" ? "Copied" : "Copy"}
                </button>
              </Panel>
              <Panel tone="gold">
                <div className="label-mono">SHARE CARD · RECEIPT</div>
                <pre className="mt-2 whitespace-pre-wrap font-mono text-xs">{shareReceipt}</pre>
                <button
                  onClick={() => copy("r2", shareReceipt)}
                  className="mt-3 rounded-md border border-accent/60 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-accent"
                >
                  {copied === "r2" ? "Copied" : "Copy"}
                </button>
              </Panel>
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                to="/intake"
                className="rounded-md bg-primary px-6 py-3 font-mono text-xs uppercase tracking-[0.24em] text-primary-foreground"
              >
                File another case
              </Link>
              <button
                onClick={() => {
                  resetCase();
                  navigate({ to: "/" });
                }}
                className="rounded-md border border-border px-6 py-3 font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground"
              >
                Shred this case file
              </button>
            </div>
          </div>
        </StageShell>
      )}

      {blackout ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black">
          <p className="label-mono animate-flicker text-primary">…</p>
        </div>
      ) : null}

      {showVideo ? (
        <FinalMediaModal
          item={finalItem}
          onClose={() => {
            setShowVideo(false);
            setStage(STAGES.length - 1);
            requestAnimationFrame(() =>
              document.getElementById("closed")?.scrollIntoView({ behavior: "smooth" }),
            );
          }}
        />
      ) : null}
    </main>
  );
}
