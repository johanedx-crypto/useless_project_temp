import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Kicker, Panel } from "@/components/kit";
import { useCaseStore } from "@/lib/case-store";
import {
  DRAMA_LEVELS,
  ROAST_LEVELS,
  ROAST_LEVEL_DESC,
  type DramaLevel,
  type IntakeData,
  type RoastLevel,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/intake")({
  head: () => ({
    meta: [
      { title: "Initiate Relationship Termination — Breakup as a Service™" },
      {
        name: "description",
        content:
          "File your case with the Department of Unnecessary Relationship Terminations. Choose your roast level and drama level. Free, always.",
      },
      { property: "og:title", content: "Initiate Relationship Termination" },
      {
        property: "og:description",
        content: "Submit your relationship for professional termination. Zero rupees.",
      },
    ],
  }),
  component: Intake,
});

const OTHER = "__OTHER__";

type Field = {
  key: keyof IntakeData;
  label: string;
  placeholder: string;
  long?: boolean;
  options?: string[];
};

const FIELDS: Field[] = [
  { key: "userName", label: "Your name", placeholder: "Johan" },
  { key: "partnerName", label: "Partner name", placeholder: "Alex" },
  {
    key: "duration",
    label: "Relationship duration",
    placeholder: "2 years",
    options: [
      "3 weeks (but intense)",
      "6 months of confusion",
      "1 year",
      "2 years",
      "4 years, mostly on WhatsApp",
      "7 years, like a mortgage",
      "Unclear. We never defined it.",
    ],
  },
  {
    key: "relationshipType",
    label: "Relationship type",
    placeholder: "Situationship with feelings",
    options: [
      "Situationship with feelings (mine)",
      "Almost-relationship, fully invested",
      "Official, but only in my phone gallery",
      "Long-distance, longer silences",
      "Talking stage that outlived governments",
      "Corporate-structured emotional internship",
      "It's complicated (their words)",
    ],
  },
  {
    key: "situation",
    label: "What went wrong?",
    placeholder: "Replies late, disappears, says nothing is wrong, returns with 'hey'.",
    long: true,
    options: [
      "Replies late, disappears, says nothing is wrong, returns with 'hey'.",
      "Bare minimum delivered consistently, like a subscription I forgot to cancel.",
      "I was the only one attending this relationship full-time.",
      "They treat effort like an optional module.",
      "Everything was fine until I asked one normal question.",
      "They found someone else's stories more interesting than my paragraphs.",
    ],
  },
  {
    key: "redFlag",
    label: "Biggest red flag",
    placeholder: "Goes offline for 2 days, calls it space",
    options: [
      "Goes offline for 2 days and calls it 'space'",
      "Online, typing, then nothing. For hours.",
      "Still friendly with every ex, alphabetically",
      "Calls my feelings 'overthinking'",
      "Says 'I'm just bad at texting' while posting 4 stories",
      "Apologises with emojis only",
      "Remembers nothing I say, remembers every cricket score",
    ],
  },
  {
    key: "annoyingHabit",
    label: "Most annoying habit",
    placeholder: "Replies 'k' to paragraphs",
    options: [
      "Replying 'k' to paragraphs",
      "Voice notes of 4 minutes saying nothing",
      "Reacting 👍 instead of replying",
      "Saying 'we'll see' about everything",
      "Falling asleep mid-argument",
      "Left me on read, then liked my post",
    ],
  },
  {
    key: "repeatedArgument",
    label: "Most repeated argument",
    placeholder: "Why didn't you reply",
    options: [
      "Why didn't you reply",
      "Who is that in your story",
      "You've changed",
      "Nothing. I'm fine.",
      "Why do I always start the conversation",
      "You never plan anything",
    ],
  },
  {
    key: "replyTime",
    label: "Typical reply time",
    placeholder: "12 hours, sometimes 2 days",
    options: [
      "Instantly, only for memes",
      "45 minutes with 'sorry was busy'",
      "6 hours, minimum",
      "12 hours, sometimes 2 days",
      "Next business day",
      "Geological time",
    ],
  },
  {
    key: "apologizesFirst",
    label: "Who apologizes first?",
    placeholder: "Me, always",
    options: [
      "Me, always",
      "Me, even when it was them",
      "Them, but with terms and conditions",
      "Nobody. We just pretend it never happened.",
      "The group chat, on my behalf",
    ],
  },
  {
    key: "startsArguments",
    label: "Who starts arguments?",
    placeholder: "Them, then they deny it",
    options: [
      "Them, then they deny it",
      "Me, by asking a normal question",
      "Their phone",
      "Both, competitively",
      "Their friend who 'means well'",
    ],
  },
  {
    key: "saysNothing",
    label: 'Who says "nothing"?',
    placeholder: "Them, professionally",
    options: [
      "Them, professionally",
      "Them, for 3 days straight",
      "Me, dramatically",
      "Both, in shifts",
      "Nothing is our third partner",
    ],
  },
  {
    key: "leavesUnread",
    label: "Who leaves messages unread?",
    placeholder: "Them, for sport",
    options: [
      "Them, for sport",
      "Them, then 'oh I saw it and forgot'",
      "Me, once, as revenge (it lasted 9 minutes)",
      "Them, only my messages",
    ],
  },
  {
    key: "reason",
    label: "Why are you considering breaking up?",
    placeholder: "I want my evenings back",
    long: true,
    options: [
      "I want my evenings back",
      "I'm tired of auditioning for a role I already had",
      "I deserve replies, not archaeology",
      "My friends are bored of my updates",
      "I want peace, and possibly sleep",
      "I've become a customer support agent for someone else's feelings",
    ],
  },
];

const CHAOS: Record<string, string> = {
  userName: "Johan",
  partnerName: "Alex",
};

function Intake() {
  const { submitCase } = useCaseStore();
  const navigate = useNavigate();
  const [values, setValues] = useState<Record<string, string>>({});
  const [custom, setCustom] = useState<Record<string, boolean>>({});
  const [roastLevel, setRoastLevel] = useState<RoastLevel>("NUCLEAR");
  const [dramaLevel, setDramaLevel] = useState<DramaLevel>("MALAYALAM MOVIE CLIMAX");
  const [hearingLanguage, setLang] = useState<"MALAYALAM" | "MANGLISH">("MALAYALAM");
  const [files, setFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const set = (k: string, v: string) => setValues((p) => ({ ...p, [k]: v }));

  const surpriseMe = () => {
    const next: Record<string, string> = { ...values };
    for (const f of FIELDS) {
      const k = f.key as string;
      if (f.options?.length) {
        next[k] = f.options[Math.floor(Math.random() * f.options.length)] as string;
      } else if (!next[k]?.trim()) {
        next[k] = CHAOS[k] ?? "";
      }
    }
    setValues(next);
    setCustom({});
    setError(null);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!values["userName"]?.trim() || !values["partnerName"]?.trim()) {
      setError("The court requires at least two names. Fictional names are accepted.");
      return;
    }
    if (!values["situation"]?.trim()) {
      setError("Please describe what went wrong. One sentence is enough evidence.");
      return;
    }
    setError(null);
    const intake = {
      ...(Object.fromEntries(
        FIELDS.map((f) => [f.key, (values[f.key as string] ?? "").trim()]),
      ) as unknown as IntakeData),
      roastLevel,
      dramaLevel,
      hearingLanguage,
      evidenceNames: files,
    };
    submitCase(intake);
    navigate({ to: "/case" });
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
      <Link to="/" className="label-mono transition-colors hover:text-accent">
        ← Department home
      </Link>
      <Kicker tone="crimson">
        <span className="mt-4 inline-block">Case intake · Form BR-01</span>
      </Kicker>
      <h1 className="mt-4 text-4xl sm:text-6xl">Initiate relationship termination</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Everything below is free. All roast levels unlocked. Nothing is stored on a server — your
        case lives in this browser only.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={surpriseMe}
          className="rounded-md border border-accent/60 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-accent transition-colors hover:bg-accent/10"
        >
          Surprise me (pick chaos for me)
        </button>
        <span className="text-xs text-muted-foreground">
          Or use the dropdowns — typing is optional, suffering is not.
        </span>
      </div>

      <form onSubmit={onSubmit} className="mt-8 space-y-8">
        <Panel className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((f) => {
            const k = f.key as string;
            const val = values[k] ?? "";
            const isCustom = custom[k] || (!!val && !f.options?.includes(val));
            return (
              <div key={k} className={cn("block", f.long && "sm:col-span-2")}>
                <span className="label-mono">{f.label}</span>
                {f.options?.length ? (
                  <select
                    aria-label={f.label}
                    value={isCustom ? OTHER : val}
                    onChange={(e) => {
                      if (e.target.value === OTHER) {
                        setCustom((p) => ({ ...p, [k]: true }));
                        set(k, "");
                      } else {
                        setCustom((p) => ({ ...p, [k]: false }));
                        set(k, e.target.value);
                      }
                    }}
                    className="mt-1.5 w-full rounded-md border border-input bg-background/70 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select the most accurate tragedy…</option>
                    {f.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                    <option value={OTHER}>✍ Other — let me type my own pain</option>
                  </select>
                ) : null}
                {!f.options?.length || isCustom ? (
                  f.long ? (
                    <textarea
                      rows={3}
                      aria-label={f.label}
                      value={val}
                      onChange={(e) => set(k, e.target.value)}
                      placeholder={f.placeholder}
                      className="mt-1.5 w-full resize-y rounded-md border border-input bg-background/70 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  ) : (
                    <input
                      aria-label={f.label}
                      value={val}
                      onChange={(e) => set(k, e.target.value)}
                      placeholder={f.placeholder}
                      className="mt-1.5 w-full rounded-md border border-input bg-background/70 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  )
                ) : null}
              </div>
            );
          })}
        </Panel>

        <Panel tone="corporate">
          <span className="label-mono">Optional evidence (never uploaded anywhere)</span>
          <input
            type="file"
            multiple
            accept="image/*"
            aria-label="Upload optional relationship evidence"
            onChange={(e) =>
              setFiles(
                Array.from(e.target.files ?? [])
                  .map((f) => f.name)
                  .slice(0, 6),
              )
            }
            className="mt-2 block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-accent/50 file:bg-transparent file:px-3 file:py-2 file:font-mono file:text-xs file:uppercase file:tracking-widest file:text-accent"
          />
          {files.length ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Filed as exhibits: {files.join(", ")}
            </p>
          ) : null}
        </Panel>

        <Panel tone="crimson" className="space-y-6">
          <div>
            <span className="label-mono">Roast level</span>
            <div className="mt-2 grid gap-2 sm:grid-cols-5">
              {ROAST_LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  aria-pressed={roastLevel === l}
                  onClick={() => setRoastLevel(l)}
                  className={cn(
                    "rounded-md border p-3 text-left transition-colors",
                    roastLevel === l
                      ? "border-primary bg-primary/20"
                      : "border-border hover:border-accent/60",
                  )}
                >
                  <span className="font-display text-sm">{l}</span>
                  <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">
                    {ROAST_LEVEL_DESC[l]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="label-mono">Drama level</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {DRAMA_LEVELS.map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={dramaLevel === d}
                  onClick={() => setDramaLevel(d)}
                  className={cn(
                    "rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors",
                    dramaLevel === d
                      ? "border-accent bg-accent/20 text-foreground"
                      : "border-border text-muted-foreground hover:border-accent/60",
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="label-mono">Final hearing language</span>
            <div className="mt-2 flex gap-2">
              {(["MALAYALAM", "MANGLISH"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  aria-pressed={hearingLanguage === l}
                  onClick={() => setLang(l)}
                  className={cn(
                    "rounded-md border px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors",
                    hearingLanguage === l
                      ? "border-primary bg-primary/20"
                      : "border-border text-muted-foreground hover:border-accent/60",
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </Panel>

        {error ? (
          <p role="alert" className="rounded-md border border-primary/60 bg-primary/10 p-3 text-sm">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="w-full rounded-md bg-primary px-6 py-4 font-mono text-xs uppercase tracking-[0.24em] text-primary-foreground shadow-[var(--shadow-cinematic)] transition-transform hover:-translate-y-0.5 sm:w-auto"
        >
          Submit case
        </button>
      </form>
    </main>
  );
}
