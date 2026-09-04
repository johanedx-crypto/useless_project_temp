import type {
  BreakupCase,
  Charge,
  CourtLine,
  DramaLevel,
  IntakeData,
  MediaTag,
  Metric,
  RoastLevel,
  RoastLine,
} from "./types";

/* ------------------------------------------------------------------ *
 * Deterministic seeded pseudo-randomness — same case, same comedy.
 * ------------------------------------------------------------------ */
export function makeRng(seedText: string) {
  let h = 2166136261;
  for (let i = 0; i < seedText.length; i++) {
    h ^= seedText.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 100000) / 100000;
  };
}
type Rng = () => number;
const pick = <T>(rng: Rng, arr: T[]): T => arr[Math.floor(rng() * arr.length) % arr.length]!;
const int = (rng: Rng, min: number, max: number) => Math.floor(min + rng() * (max - min + 1));

const clean = (s: string, fallback: string) => {
  const t = (s || "").trim();
  return t.length ? t.replace(/\s+/g, " ").slice(0, 220) : fallback;
};
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/* Roast intensity shaping ------------------------------------------- */
const HEAT: Record<RoastLevel, number> = {
  LIGHT: 0,
  SAVAGE: 1,
  BRUTAL: 2,
  NUCLEAR: 3,
  APOCALYPTIC: 4,
};

function sharpen(level: RoastLevel, lines: string[]): string {
  // pick a line whose severity matches the requested heat
  const i = Math.min(lines.length - 1, HEAT[level]);
  return lines[i] ?? lines[lines.length - 1] ?? "";
}

export function caseNumber(rng: Rng) {
  return `BR-2026-${int(rng, 1000, 9999)}`;
}

/* ------------------------------------------------------------------ *
 * 1. analyzeRelationship
 * ------------------------------------------------------------------ */
export function analyzeRelationship(intake: IntakeData) {
  const rng = makeRng(JSON.stringify(intake));
  const p = clean(intake.partnerName, "The Defendant");
  const u = clean(intake.userName, "The Complainant");
  return {
    rng,
    p,
    u,
    reply: clean(intake.replyTime, "eventually"),
    flag: clean(intake.redFlag, "selective hearing"),
    habit: clean(intake.annoyingHabit, "saying 'k'"),
    argument: clean(intake.repeatedArgument, "the same argument, again"),
    situation: clean(intake.situation, "it stopped working and nobody admitted it"),
    reason: clean(intake.reason, "self-preservation"),
    duration: clean(intake.duration, "an unreasonable amount of time"),
    type: clean(intake.relationshipType, "situationship"),
    level: intake.roastLevel,
    drama: intake.dramaLevel,
  };
}
type Ctx = ReturnType<typeof analyzeRelationship>;

/* ------------------------------------------------------------------ *
 * 2. generateRelationshipMetrics
 * ------------------------------------------------------------------ */
export function generateRelationshipMetrics(c: Ctx): Metric[] {
  const r = c.rng;
  return [
    {
      label: "LOVE INDEX",
      value: int(r, 6, 34),
      note: `Detected trace amounts of affection, mostly stored inside old screenshots of "${c.argument}".`,
    },
    {
      label: "COMMUNICATION EFFICIENCY",
      value: int(r, 4, 22),
      note: `Reply window logged as "${c.reply}". Currently operating below carrier-pigeon bandwidth.`,
    },
    {
      label: "REPLY SPEED",
      value: int(r, 3, 18),
      note: `Communication efficiency has officially fallen below the response time of a government office.`,
    },
    {
      label: "RED FLAG DENSITY",
      value: int(r, 76, 99),
      note: `Primary flag "${lower(c.flag)}" was not a flag. It was a parade with sponsors.`,
    },
    {
      label: "EMOTIONAL AVAILABILITY",
      value: int(r, 2, 19),
      note: `${c.p} appears to hold a full-time position at the Ministry of Being Busy.`,
    },
    {
      label: "ARGUMENT FREQUENCY",
      value: int(r, 71, 98),
      note: `${int(r, 24, 91)} recorded arguments. ${int(r, 18, 40)} of them were the identical argument wearing a new outfit.`,
    },
    {
      label: '"IT\'S FINE" CREDIBILITY',
      value: int(r, 1, 11),
      note: `Subject repeatedly answered "nothing" while producing enough emotional evidence to qualify as a national emergency.`,
    },
    {
      label: "SECOND-CHANCE PROBABILITY",
      value: int(r, 8, 26),
      note: `The department has already issued ${int(r, 2, 7)} second chances. Stock has been discontinued.`,
    },
    {
      label: "GETTING-BACK-TOGETHER PROBABILITY",
      value: int(r, 12, 44),
      note: `Statistically low. Emotionally, at 2:17 AM, catastrophically high.`,
    },
    {
      label: "BAD DECISION PROBABILITY",
      value: int(r, 68, 96),
      note: `${c.u} has a documented history of calling this "just checking in".`,
    },
    {
      label: "EMOTIONAL DAMAGE",
      value: int(r, 74, 99),
      note: `Damage is structural. Load-bearing feelings have been removed.`,
    },
  ];
}

/* ------------------------------------------------------------------ *
 * 3. generateRoastReport
 * ------------------------------------------------------------------ */
export function generateRoastReport(c: Ctx, intake: IntakeData): RoastLine[] {
  const r = c.rng;
  const L = c.level;
  return [
    {
      label: "BIGGEST RED FLAG",
      text: sharpen(L, [
        `"${c.flag}" — the committee found this mildly concerning.`,
        `"${c.flag}" was reported as a quirk. It has been reclassified as a warning label.`,
        `"${c.flag}" is not a red flag. It is a red flag with a marketing department.`,
        `"${c.flag}" was visible from space, and ${c.u} chose to call it "just their personality".`,
        `"${c.flag}" should have been disclosed in writing, notarised, and read aloud at the beginning of this relationship by a lawyer with a serious expression.`,
      ]),
    },
    {
      label: "MOST QUESTIONABLE BEHAVIOUR",
      text: `${c.p} maintained the habit of ${lower(c.habit)} for ${c.duration} and treated it as a personality trait rather than an incident report.`,
    },
    {
      label: "MOST USELESS ARGUMENT",
      text: `"${c.argument}". Fought ${int(r, 12, 63)} times. Resolved zero times. Somehow both parties consider themselves undefeated.`,
    },
    {
      label: "MOST DELUSIONAL MOMENT",
      text: sharpen(L, [
        `Believing "${lower(c.situation)}" would fix itself over the weekend.`,
        `Believing a ${c.type} could be repaired with a paragraph typed at 1 AM and deleted at 1:04 AM.`,
        `Believing "${lower(c.reason)}" was a phase, and not the executive summary.`,
        `Believing that the person who replies "${c.reply}" was going to suddenly discover urgency.`,
        `Believing that love conquers all, when the evidence shows love could not even conquer a notification badge.`,
      ]),
    },
    {
      label: "BIGGEST CONTRIBUTION TO THE PROBLEM",
      text: `${c.u} accepted the standard "${c.reply}" reply time and rebranded it as patience. The court calls this unpaid emotional labour.`,
    },
    {
      label: "WHO WAS ACTUALLY WRONG?",
      text: `${pick(r, [c.p, c.p, `${c.p}, mostly, with ${c.u} providing enthusiastic logistical support`])}.`,
    },
    {
      label: "WHO SHOULD APOLOGIZE?",
      text: `Records show "${clean(intake.apologizesFirst, "unclear")}" apologises first. Records also show it was never the person who caused it.`,
    },
    {
      label: "WHO WILL TEXT FIRST?",
      text: `${pick(r, [c.u, c.p])}, at ${int(r, 1, 3)}:${String(int(r, 10, 59)).padStart(2, "0")} AM, with the word "hey" and no follow-up plan.`,
    },
    {
      label: "WHO WILL STALK INSTAGRAM FIRST?",
      text: `${pick(r, [c.u, c.p])} — within ${int(r, 4, 40)} minutes of this report being generated.`,
    },
    {
      label: 'WHO WILL SAY "I MISS YOU" FIRST?',
      text: `Whoever is holding a phone with ${int(r, 2, 9)}% battery and no supervision.`,
    },
    {
      label: "MOST EMBARRASSING MOMENT",
      text: `The ${int(r, 3, 19)}-minute voice note. It has been sealed by the court for the protection of everyone involved.`,
    },
    {
      label: "RELATIONSHIP IQ",
      text: `${int(r, 12, 61)}. For reference, a group chat deciding where to eat scores 74.`,
    },
    {
      label: "FINAL ROAST",
      text: sharpen(L, [
        `This was not a great love story. It was a subscription neither of you cancelled.`,
        `You did not have a relationship. You had a recurring meeting with no agenda and no minutes.`,
        `${c.duration} of effort produced one argument about "${c.argument}", ${int(r, 400, 900)} screenshots, and this document.`,
        `${c.p} gave you "${c.reply}" reply times and you gave them ${c.duration} of your only life. The court finds that exchange rate criminal.`,
        `You were not in a ${c.type}. You were in an unpaid internship at a company with no product, no revenue, and one employee who kept saying "nothing".`,
      ]),
    },
  ];
}

/* ------------------------------------------------------------------ *
 * 4. generateHRReview / warning / termination
 * ------------------------------------------------------------------ */
export function generateHRReview(c: Ctx) {
  const r = c.rng;
  const metrics = [
    {
      label: "Communication",
      stars: 1,
      note: `Employee demonstrated a repeated inability to respond before civilization collapsed. Logged interval: "${c.reply}".`,
    },
    {
      label: "Effort",
      stars: int(r, 1, 2),
      note: `Effort peaked in month one and has been in managed decline ever since, like a startup after funding.`,
    },
    {
      label: "Emotional Support",
      stars: 1,
      note: `Employee responded to distress with "you're overthinking", a phrase HR has now added to the banned vocabulary list.`,
    },
    {
      label: "Reply Speed",
      stars: 1,
      note: `Slower than internal IT. Slower than the passport office. Comparable to geological processes.`,
    },
    {
      label: "Consistency",
      stars: int(r, 1, 2),
      note: `Employee was consistent in exactly one area: ${lower(c.habit)}.`,
    },
    {
      label: "Argument Management",
      stars: 1,
      note: `Escalated "${c.argument}" ${int(r, 11, 48)} times without a single documented resolution.`,
    },
    {
      label: "Apology Quality",
      stars: int(r, 1, 2),
      note: `Apologies delivered in the tone of a software changelog: "sorry, fixed some things".`,
    },
    {
      label: "Random Drama",
      stars: 5,
      note: `Outstanding performance. Exceeded all targets. Only category where the employee overdelivered.`,
    },
    {
      label: "Emotional Availability",
      stars: 1,
      note: `Employee was unreachable during business hours, non-business hours, and emotionally significant hours.`,
    },
  ];
  return {
    metrics,
    status: "CRITICALLY BELOW EXPECTATIONS",
    summary: `Employee ${c.p} has served ${c.duration} in ROMANTIC OPERATIONS. Performance is not merely below expectations — it has redefined where expectations are allowed to begin.`,
  };
}

export function generateWarning(c: Ctx) {
  return {
    violations: [
      "Excessive dry texting (Section 4.1 — Single-Character Replies)",
      "Unauthorized disappearing without filing leave",
      'Chronic "K" usage in emotionally sensitive threads',
      "Failure to communicate despite repeated onboarding",
      `Emotional overtime imposed on ${c.u} with no compensation`,
      `Repeated "nothing" incidents (${clean(c.rng() > 0.5 ? "escalated" : "unresolved", "unresolved")})`,
      "Unauthorized jealousy outside approved jurisdiction",
      "Failure to provide basic reassurance during scheduled crises",
      `Recurring incident: ${lower(c.habit)}`,
    ],
    finalWarning: "Further violations may result in immediate termination of romantic employment.",
  };
}

export function generateTerminationNotice(c: Ctx) {
  return {
    body: [
      `Dear ${c.p},`,
      `Following a comprehensive internal investigation conducted by the Department of Unnecessary Relationship Terminations, and after review of your performance file, chat records, and the incident described as "${lower(c.situation)}", we regret to inform you that your romantic employment has been terminated with immediate effect.`,
      `This decision is final, was reached unanimously, and required significantly less deliberation than you required to answer a text message.`,
      `You are requested to return all hoodies, chargers, playlist access, and any remaining emotional property belonging to ${c.u}. Your access to late-night conversations has been revoked.`,
    ],
    severance: [
      "0 hugs",
      "0 kisses",
      "0 second chances",
      "0 refunds",
      "Benefits: CANCELLED.",
      "Emotional warranty: EXPIRED.",
    ],
  };
}

export function generateExitInterviewAnalysis(c: Ctx, answers: Record<string, string>): string[] {
  const vals = Object.values(answers);
  const delusional = vals.filter((v) => v === "I'M STILL DELUSIONAL").length;
  const out = [
    `Exit interview processed. ${vals.length} responses recorded, ${delusional} of which HR has flagged for observation.`,
  ];
  if (delusional >= 3)
    out.push(
      `${c.u} selected "I'M STILL DELUSIONAL" ${delusional} times. HR recommends removing this person's phone at 1 AM by force of policy.`,
    );
  else if (delusional > 0)
    out.push(
      `A residual delusion level of ${delusional} was detected. This is within the tragic-but-survivable range.`,
    );
  else
    out.push(
      `Zero delusion detected, which HR believes means you are lying beautifully and professionally.`,
    );
  out.push(
    `Recommendation: do not rehire ${c.p}. Do not rehire ${c.p} in a different font. Do not rehire ${c.p} because they posted a story.`,
  );
  return out;
}

/* ------------------------------------------------------------------ *
 * 5. Court
 * ------------------------------------------------------------------ */
export function generateCharges(c: Ctx): Charge[] {
  const r = c.rng;
  const base: Charge[] = [
    {
      count: "COUNT I",
      title: "EXCESSIVE DRY TEXTING",
      detail: `Sustaining a ${c.duration} conversation using "hm", "ok" and "lol" as load-bearing structures.`,
    },
    {
      count: "COUNT II",
      title: "CHRONIC EMOTIONAL UNAVAILABILITY",
      detail: `Emotionally unreachable while simultaneously online. The court considers this aggravating.`,
    },
    {
      count: "COUNT III",
      title: "UNAUTHORIZED GHOSTING",
      detail: `Disappearance logged. Reply window: "${c.reply}". No paperwork filed.`,
    },
    {
      count: "COUNT IV",
      title: 'FIRST-DEGREE "K" USAGE',
      detail: `A single character deployed as a weapon of mass emotional destruction.`,
    },
    {
      count: "COUNT V",
      title: 'REPEATED "I\'M BUSY" FRAUD',
      detail: `Claimed unavailability while producing ${int(r, 3, 14)} Instagram stories in the same window.`,
    },
    {
      count: "COUNT VI",
      title: "FAILURE TO COMMUNICATE",
      detail: `Said "nothing" while operating a full-scale emotional crisis in the background.`,
    },
    {
      count: "COUNT VII",
      title: "UNNECESSARY DRAMA",
      detail: `Argument "${c.argument}" was relitigated ${int(r, 12, 47)} times without new evidence.`,
    },
    {
      count: "COUNT VIII",
      title: `AGGRAVATED ${c.flag.toUpperCase().slice(0, 40)}`,
      detail: `Presented as charming. Reclassified by the court as a pattern.`,
    },
  ];
  return base;
}

export function generateProsecution(c: Ctx) {
  const r = c.rng;
  return {
    opening: `Your Honour, the prosecution will demonstrate that this ${c.type} survived almost entirely through screenshots, false promises, and one person's ability to say "it's okay" while quietly preparing a ${int(r, 11, 27)}-page emotional complaint. The defendant, ${c.p}, replied "${c.reply}", called it "being busy", and expected a standing ovation for eventually existing.`,
    exhibits: [
      {
        id: "EXHIBIT A",
        title: "CHAT BEHAVIOUR",
        roast: `${int(r, 300, 900)} messages from ${c.u}. ${int(r, 40, 120)} from ${c.p}, of which ${int(r, 20, 60)} were "hm". The prosecution submits that this is not a conversation, it is a customer support ticket that was never resolved.`,
      },
      {
        id: "EXHIBIT B",
        title: "RELATIONSHIP STATISTICS",
        roast: `Communication efficiency measured in the single digits. The defendant's emotional availability graph is not a graph, Your Honour, it is a flat line with a sad little dot at the start.`,
      },
      {
        id: "EXHIBIT C",
        title: "USER TESTIMONY",
        roast: `The complainant stated, and I quote, "${c.situation}". The prosecution notes that the defendant's entire defence strategy for ${c.duration} was simply waiting for the complainant to get tired.`,
      },
      {
        id: "EXHIBIT D",
        title: "THE HABIT",
        roast: `${c.habit} — performed daily, without remorse, and without a single moment of self-awareness. The prosecution rests, exhausted.`,
      },
    ],
  };
}

export function generateDefense(c: Ctx): CourtLine[] {
  const r = c.rng;
  return [
    { role: "DEFENSE", text: `Your Honour, my client was busy.` },
    { role: "PROSECUTION", text: `Busy for ${int(r, 9, 31)} hours?` },
    { role: "DEFENSE", text: `...` },
    { role: "JUDGE", text: `Noted.` },
    {
      role: "DEFENSE",
      text: `Your Honour, my client did reply. Eventually. With a thumbs up. Which in some cultures is affection.`,
    },
    { role: "PROSECUTION", text: `Which cultures?` },
    { role: "DEFENSE", text: `I will submit that in writing.` },
    {
      role: "JUDGE",
      text: `The court will not be receiving that document.`,
    },
    {
      role: "DEFENSE",
      text: `Your Honour, my client maintains that the argument about "${c.argument}" was a misunderstanding.`,
    },
    {
      role: "PROSECUTION",
      text: `It occurred ${int(r, 12, 44)} times. At what point does a misunderstanding become a hobby?`,
    },
    {
      role: "DEFENSE",
      text: `My client also states they "never meant to hurt anyone", which is technically true, because my client was not thinking about anyone.`,
    },
    { role: "JUDGE", text: `Counsel, you are prosecuting your own client.` },
    { role: "DEFENSE", text: `I am aware, Your Honour. I have read the file.` },
  ];
}

export function generateObjection(c: Ctx, n: number): string {
  const r = makeRng(`obj${n}${c.p}${c.u}`);
  return pick(r, [
    `OVERRULED. That excuse has already been used ${int(r, 21, 63)} times.`,
    `SUSTAINED. Somehow the defense has made the situation worse.`,
    `OBJECTION DENIED. The court is tired.`,
    `SUSTAINED. The court agrees that "I was going to reply" is not a reply.`,
    `OVERRULED. Being online while ignoring someone is not a legal defence, it is a confession.`,
    `OBJECTION NOTED AND IMMEDIATELY REGRETTED BY EVERYONE PRESENT.`,
    `OVERRULED. The court has read the chat. The court needs a moment.`,
    `SUSTAINED. Counsel will stop saying "she knew how I was".`,
  ]);
}

const VERDICTS = [
  "GUILTY",
  "PARTIALLY GUILTY",
  "GUILTY OF BEING COMPLETELY EXHAUSTING",
  "GUILTY OF WASTING EVERYONE'S TIME",
  "EXTREMELY GUILTY",
  "RELATIONSHIP BEYOND REPAIR",
  "NOT GUILTY",
];

export function generateVerdict(c: Ctx, metrics: Metric[]) {
  const r = c.rng;
  const damage = metrics.find((m) => m.label === "EMOTIONAL DAMAGE")?.value ?? 88;
  const heat = HEAT[c.level];
  let verdict: string;
  if (damage > 92 && heat >= 3) verdict = "EXTREMELY GUILTY";
  else if (damage > 88) verdict = "RELATIONSHIP BEYOND REPAIR";
  else if (damage > 82) verdict = "GUILTY OF BEING COMPLETELY EXHAUSTING";
  else if (damage > 78) verdict = "GUILTY";
  else verdict = pick(r, VERDICTS.slice(1, 5));
  return {
    verdict,
    cause: `Sustained communication collapse, aggravated by "${lower(c.flag)}", ${lower(c.habit)}, and ${int(r, 12, 47)} identical arguments about "${c.argument}". The court finds that this ${c.type} did not end. It expired, quietly, some months ago, and both parties kept attending the funeral without noticing.`,
    emotionalDamage: damage,
  };
}

export function generateSentence(c: Ctx): string[] {
  const r = c.rng;
  const pool = [
    `${int(r, 21, 90)} days of No Contact, enforced by this court and your own dignity.`,
    `Mandatory removal from Favorites, Close Friends, and the top of your keyboard suggestions.`,
    `Three months without checking Last Seen.`,
    `Permanent ban on sending "I miss you" at 2:17 AM.`,
    `Mandatory deletion of ${int(r, 300, 940)} screenshots. The court will not be reviewing them.`,
    `Lifetime sentence of pretending you don't care, to be performed convincingly in public.`,
    `Immediate archival of the playlist titled with a lowercase name and one emoji.`,
    `Court-ordered ban on typing "hey" and deleting it ${int(r, 4, 12)} times per night.`,
    `Restraining order against the phrase "we can still be friends".`,
    `Confiscation of the hoodie. It is now evidence.`,
  ];
  const out: string[] = [];
  while (out.length < 6) {
    const s = pick(r, pool);
    if (!out.includes(s)) out.push(s);
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * 6. Autopsy / funeral / receipt / damage / recovery / certificate
 * ------------------------------------------------------------------ */
export function generateAutopsy(c: Ctx) {
  const r = c.rng;
  const now = new Date();
  return {
    causeOfDeath: `Chronic under-communication with complications arising from ${lower(c.flag)}. Death was not sudden. It was scheduled, repeatedly postponed, and finally attended by only one person.`,
    factors: [
      "Communication Failure",
      "Emotional Negligence",
      `Overthinking (${int(r, 400, 2000)} documented hours)`,
      "Poor Timing",
      "Dry Texting",
      `Unnecessary Arguments (subject: "${c.argument}")`,
      "Instagram Activity",
      '"Nothing" Syndrome',
      `${c.habit} (contributing, aggravating)`,
    ],
    timeOfDeath: now.toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" }),
    lastWords: pick(r, [
      `"ok"`,
      `"do what you want"`,
      `"i said nothing is wrong"`,
      `"we'll talk later"`,
      `"i'm just tired"`,
    ]),
  };
}

export function generateFuneral(c: Ctx) {
  const r = c.rng;
  const endYear = new Date().getFullYear();
  const yrs = parseInt(c.duration) || 2;
  return {
    years: `${endYear - Math.max(1, Math.min(yrs, 15))} — ${endYear}`,
    eulogy: [
      "They had good moments.",
      "They had bad moments.",
      `They had ${int(r, 24, 91)} arguments about the same thing.`,
      `They had one shared playlist and ${int(r, 2, 9)} unresolved conversations.`,
      `They will be remembered by ${c.u}, at inconvenient times, in supermarkets, for no reason.`,
    ],
    causes: ["Communication Failure", "Emotional Neglect", "Chronic Dry Texting", `${c.flag}`],
  };
}

export function generateReceipt(c: Ctx) {
  const r = c.rng;
  const lines = [
    { item: "Relationship Duration", qty: c.duration, amount: int(r, 40000, 190000) },
    { item: "Memories", qty: `${int(r, 200, 900)} units`, amount: int(r, 9000, 40000) },
    { item: "Arguments", qty: `${int(r, 24, 91)}`, amount: int(r, 12000, 60000) },
    { item: "Unread Messages", qty: `${int(r, 40, 400)}`, amount: int(r, 4000, 22000) },
    { item: '"Okay" Messages', qty: `${int(r, 60, 500)}`, amount: int(r, 3000, 19000) },
    { item: '"Nothing" Incidents', qty: `${int(r, 8, 60)}`, amount: int(r, 6000, 33000) },
    { item: "Late-night Calls", qty: `${int(r, 10, 120)}`, amount: int(r, 5000, 25000) },
    { item: "Apologies (yours)", qty: `${int(r, 20, 200)}`, amount: int(r, 8000, 44000) },
    { item: "Second Chances", qty: `${int(r, 2, 7)}`, amount: int(r, 20000, 90000) },
  ];
  return {
    lines,
    total: lines.reduce((a, b) => a + b.amount, 0),
    reason: "Relationship warranty expired.",
  };
}

export function generateDamageReport(c: Ctx): Metric[] {
  const r = c.rng;
  return [
    { label: "HEART DAMAGE", value: int(r, 72, 98), note: "Structural. Do not load-test." },
    {
      label: "MENTAL DAMAGE",
      value: int(r, 64, 95),
      note: `Brain currently running "${c.argument}" as a background process.`,
    },
    {
      label: "TIME WASTED",
      value: int(r, 60, 96),
      unit: "%",
      note: `${int(r, 900, 6000)} hours. ${int(r, 200, 900)} of them spent waiting for a reply.`,
    },
    {
      label: "MONEY WASTED",
      value: int(r, 40, 92),
      note: `₹${int(r, 8, 90)},${int(r, 100, 999)} in gifts, cabs and food ordered during arguments.`,
    },
    {
      label: "SLEEP LOST",
      value: int(r, 55, 94),
      note: `${int(r, 90, 700)} hours of premium 2 AM ceiling-staring.`,
    },
    {
      label: "INSTAGRAM STALKING",
      value: int(r, 70, 99),
      note: `${int(r, 400, 3000)} profile visits. ${int(r, 1, 4)} accidental likes on ${int(r, 2, 5)}-year-old photos.`,
    },
    {
      label: "OVERTHINKING",
      value: int(r, 80, 99),
      note: `Peak capacity reached. Your brain is now a courtroom with no adjournment.`,
    },
  ];
}

export function generateRecovery(c: Ctx) {
  const r = c.rng;
  return [
    {
      day: "DAY 1",
      stalking: int(r, 12, 22),
      typedHey: int(r, 3, 8),
      sent: 0,
      stability: int(r, 8, 18),
      note: "You are functioning at the level of a wet notebook. This is expected.",
    },
    {
      day: "DAY 7",
      stalking: int(r, 6, 11),
      typedHey: int(r, 1, 4),
      sent: 0,
      stability: int(r, 30, 48),
      note: "You listened to one sad song and called it healing.",
    },
    {
      day: "DAY 14",
      stalking: int(r, 3, 7),
      typedHey: 1,
      sent: 0,
      stability: int(r, 52, 66),
      note: "You went to the gym once. The court acknowledges the effort.",
    },
    {
      day: "DAY 30",
      stalking: 1,
      typedHey: 0,
      sent: 0,
      stability: 87,
      note: `You forgot to check whether ${c.p} posted. That is the whole treatment.`,
    },
  ];
}

export function generateCertificate(c: Ctx) {
  return {
    reason: `Irreparable communication breakdown, ${lower(c.flag)}, and ${lower(c.reason)}. Terminated with full institutional dignity and zero rupees.`,
  };
}

/* ------------------------------------------------------------------ *
 * 7. Final roast
 * ------------------------------------------------------------------ */
export function generateFinalRoast(c: Ctx): string[] {
  const r = c.rng;
  const lines = [
    `You didn't lose your soulmate. You lost a notification habit.`,
    `${c.duration} of memories. ${int(r, 200, 700)} arguments. ${int(r, 400, 900)} screenshots. And somehow the biggest achievement of the relationship is this document.`,
    `${c.p} was never going to change. ${c.p} was going to reply "${c.reply}" at your wedding.`,
    `You kept saying "they're just bad at texting". Sir, madam — they were bad at you.`,
    `The court has reviewed everything and concluded that the most consistent thing in your ${c.type} was ${lower(c.habit)}.`,
    `You did not get closure. You got a case number. Frame it.`,
  ];
  const n = Math.min(5, 3 + Math.floor(HEAT[c.level] / 2));
  return lines.slice(0, n);
}

/* ------------------------------------------------------------------ *
 * 8. Malayalam hearing (original lines, not translations)
 * ------------------------------------------------------------------ */
export function generateMalayalamHearing(c: Ctx, intake: IntakeData): CourtLine[] {
  const r = c.rng;
  const mal = intake.hearingLanguage !== "MANGLISH";
  const p = c.p;
  const heat = HEAT[c.level];

  const malLines: CourtLine[] = [
    {
      role: "PROSECUTION",
      text: `മാന്യനായ ജഡ്ജിയേ, ഈ ബന്ധത്തിൽ സ്നേഹത്തേക്കാൾ കൂടുതൽ ഉണ്ടായിരുന്നത് "seen" ആയിരുന്നു.`,
    },
    {
      role: "DEFENSE",
      text: `മാന്യനായ കോടതിയേ, എന്റെ ക്ലയന്റ് ${p} വളരെ busy ആയിരുന്നു. ജോലി, family, mental peace — എല്ലാം ഒരുമിച്ച് വന്നു.`,
    },
    {
      role: "JUDGE",
      text: `Busy ആയിരുന്നു എന്ന് പറയുന്നു. പക്ഷേ Instagram-ൽ online ആയിരുന്നു. കോടതി അത് ശ്രദ്ധിച്ചിട്ടുണ്ട്.`,
    },
    {
      role: "PROSECUTION",
      text: `അതുമാത്രമല്ല, "ഒന്നുമില്ല" എന്ന് പറഞ്ഞിട്ട് ${int(r, 2, 5)} ദിവസത്തെ drama നടത്തിയത് രേഖകളിൽ വ്യക്തമാണ്.`,
    },
    {
      role: "PROSECUTION",
      text: `Reply വരാൻ എടുത്ത സമയം "${c.reply}". ജഡ്ജിയേ, village office-ൽ certificate കിട്ടാൻ പോലും ഇത്രയും സമയം എടുക്കില്ല.`,
    },
    {
      role: "DEFENSE",
      text: `ജഡ്ജിയേ, എന്റെ ക്ലയന്റ് ചെയ്ത ഏറ്റവും വലിയ തെറ്റ് "${lower(c.habit)}" മാത്രമാണ്. അത് ഒരു ശീലം മാത്രം.`,
    },
    {
      role: "JUDGE",
      text: `ശീലം ${c.duration} തുടർന്നാൽ അത് ശീലമല്ല, അത് character ആണ്.`,
    },
    {
      role: "PROSECUTION",
      text: `"${c.argument}" എന്ന വിഷയത്തിൽ ${int(r, 12, 44)} തവണ വാദം നടന്നു. ഒരു തവണ പോലും തീരുമാനം ഉണ്ടായില്ല. ഇത് ബന്ധമല്ല ജഡ്ജിയേ, ഇത് ഒരു serial ആണ് — season 6, കഥ ഇതുവരെ നീങ്ങിയിട്ടില്ല.`,
    },
    {
      role: "JUDGE",
      text: `ഇത് relationship അല്ല. ഇത് ഒരു unpaid internship ആണ്. അതും appraisal ഇല്ലാത്ത.`,
    },
    {
      role: "DEFENSE",
      text: `...ജഡ്ജിയേ, ഞാൻ ഒന്നും പറയാനില്ല.`,
    },
    {
      role: "JUDGE",
      text: `ആ ഒരു കാര്യത്തിൽ കോടതി defence-നോട് പൂർണ്ണമായി യോജിക്കുന്നു.`,
    },
  ];

  const mangLines: CourtLine[] = [
    {
      role: "PROSECUTION",
      text: `Judge-e, ee relationship-il sneham-ne kaalum kooduthal undaayirunnathu "seen" aayirunnu.`,
    },
    {
      role: "DEFENSE",
      text: `Judge-e, ente client ${p} valare busy aayirunnu. Work, family, mental peace — ellaam onnichu vannu.`,
    },
    {
      role: "JUDGE",
      text: `Busy aayirunnu ennu parayunnu. Pakshe Instagram-il online aayirunnu. Court athu shraddhichittundu.`,
    },
    {
      role: "PROSECUTION",
      text: `Athu maathramalla, "onnumilla" ennu paranjittu ${int(r, 2, 5)} divasathe drama nadathiyathu rekhakalil vyakthamaanu.`,
    },
    {
      role: "PROSECUTION",
      text: `Reply varaan eduthu samayam "${c.reply}". Judge-e, village office-il certificate kittaan polum ithra samayam edukkilla.`,
    },
    {
      role: "JUDGE",
      text: `Sheelam ${c.duration} thudarnnaal athu sheelam alla, athu character aanu.`,
    },
    {
      role: "PROSECUTION",
      text: `"${c.argument}" ennathil ${int(r, 12, 44)} thavana vaadam nadannu. Oru thavana polum theerumaanam undaayilla. Ithu relationship alla, ithu oru serial aanu.`,
    },
    { role: "JUDGE", text: `Ithu relationship alla. Ithu oru unpaid internship aanu.` },
    { role: "DEFENSE", text: `...Judge-e, njan onnum parayaanilla.` },
    { role: "JUDGE", text: `Aa oru kaaryathil court defence-inodu poornnamaayi yojikkunnu.` },
  ];

  const lines = mal ? malLines : mangLines;
  // intensity: light hearing is shorter and softer, apocalyptic keeps everything
  const keep = Math.min(lines.length, 5 + heat * 2);
  return lines.slice(0, keep);
}

export function generateMalayalamJudgment(c: Ctx, intake: IntakeData, verdict: string) {
  const r = c.rng;
  const mal = intake.hearingLanguage !== "MANGLISH";
  if (mal) {
    return {
      intro: `ഈ കോടതി പരിശോധിച്ച എല്ലാ തെളിവുകളുടെയും അടിസ്ഥാനത്തിൽ, HR റിപ്പോർട്ട്, chat രേഖകൾ, ${int(r, 400, 900)} screenshots, എന്നിവ കണക്കിലെടുത്ത്... ഈ ബന്ധം...`,
      verdict:
        verdict === "NOT GUILTY"
          ? `കുറ്റക്കാരനല്ല. പക്ഷേ കോടതിക്ക് സംശയമുണ്ട്.`
          : `കുറ്റക്കാരനാണ്.`,
      sentence: `ശിക്ഷയായി ${int(r, 21, 90)} ദിവസത്തെ No Contact. Last seen നോക്കാൻ പൂർണ്ണ വിലക്ക്.`,
      punchline: pick(r, [
        `ഇനി "ഹായ്" അയക്കാൻ ശ്രമിച്ചാൽ ഈ കോടതി നിങ്ങളുടെ keyboard പിടിച്ചെടുക്കുന്നതായിരിക്കും.`,
        `രാത്രി 2 മണിക്ക് ഫോൺ എടുക്കുന്നത് ഈ കോടതി ഗുരുതരമായ കുറ്റമായി കണക്കാക്കും.`,
        `അടുത്ത തവണ "അവൻ/അവൾ മാറും" എന്ന് പറഞ്ഞാൽ കോടതി നിങ്ങളെയും പ്രതിയാക്കും.`,
      ]),
    };
  }
  return {
    intro: `Ee court parishodhicha ellaa thelivukalude adisthaanathil, HR report, chat rekhakal, ${int(r, 400, 900)} screenshots ellaam kanakkileduthu... ee bandham...`,
    verdict:
      verdict === "NOT GUILTY"
        ? `Kuttakkaaran alla. Pakshe court-inu samsayam undu.`
        : `Kuttakkaaran aanu.`,
    sentence: `Shikshayaayi ${int(r, 21, 90)} divasathe No Contact. Last seen nokkaan poornna vilakku.`,
    punchline: `Ini "hi" ayakkaan shramichaal ee court ningalude keyboard pidichedukkunnathaayirikkum.`,
  };
}

/* ------------------------------------------------------------------ *
 * 9. Media mood
 * ------------------------------------------------------------------ */
export function generateMediaMood(verdict: string, level: RoastLevel): MediaTag[] {
  const heat = HEAT[level];
  if (verdict === "NOT GUILTY") return ["VICTORY", "FUNNY"];
  if (verdict === "RELATIONSHIP BEYOND REPAIR") return ["FUNERAL", "DRAMATIC", "FINAL_VERDICT"];
  if (verdict === "EXTREMELY GUILTY")
    return ["NUCLEAR", "SAVAGE", "ANGRY", "FINAL_VERDICT", "SHOCK"];
  const base: MediaTag[] = ["GUILTY", "FINAL_VERDICT", "DRAMATIC"];
  if (heat >= 3) base.push("NUCLEAR", "SAVAGE");
  if (heat <= 1) base.push("FUNNY");
  return base;
}

/* ------------------------------------------------------------------ *
 * Assemble whole case
 * ------------------------------------------------------------------ */
export function buildCase(intake: IntakeData): BreakupCase {
  const c = analyzeRelationship(intake);
  const metrics = generateRelationshipMetrics(c);
  const verdict = generateVerdict(c, metrics);
  return {
    caseNumber: caseNumber(makeRng(intake.userName + intake.partnerName + intake.situation)),
    createdAt: new Date().toISOString(),
    intake,
    metrics,
    roastReport: generateRoastReport(c, intake),
    hrReport: generateHRReview(c),
    warning: generateWarning(c),
    termination: generateTerminationNotice(c),
    charges: generateCharges(c),
    prosecution: generateProsecution(c),
    defense: generateDefense(c),
    objections: [1, 2, 3].map((n) => generateObjection(c, n)),
    verdict,
    sentence: generateSentence(c),
    autopsy: generateAutopsy(c),
    funeral: generateFuneral(c),
    receipt: generateReceipt(c),
    damage: generateDamageReport(c),
    recovery: generateRecovery(c),
    certificate: generateCertificate(c),
    finalRoast: generateFinalRoast(c),
    malayalamHearing: generateMalayalamHearing(c, intake),
    malayalamJudgment: generateMalayalamJudgment(c, intake, verdict.verdict),
    mediaMood: generateMediaMood(verdict.verdict, intake.roastLevel),
  };
}

export const DEMO_INTAKE: IntakeData = {
  userName: "Johan",
  partnerName: "Alex",
  duration: "2 years",
  relationshipType: "Long-term situationship with corporate structure",
  situation:
    "Replies late, disappears randomly, says nothing is wrong, comes back with 'hey' like nothing happened.",
  redFlag: "Goes offline for two days and calls it 'space'",
  annoyingHabit: "Replying 'k' to paragraphs",
  repeatedArgument: "Why didn't you reply",
  replyTime: "12 hours, sometimes 2 days",
  apologizesFirst: "Me, always",
  startsArguments: "Them, then they deny it",
  saysNothing: "Them, professionally",
  leavesUnread: "Them, for sport",
  reason: "I want my evenings back",
  roastLevel: "NUCLEAR",
  dramaLevel: "MALAYALAM MOVIE CLIMAX",
  hearingLanguage: "MALAYALAM",
};

export type { DramaLevel };
