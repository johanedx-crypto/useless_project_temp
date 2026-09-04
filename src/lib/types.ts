export const ROAST_LEVELS = ["LIGHT", "SAVAGE", "BRUTAL", "NUCLEAR", "APOCALYPTIC"] as const;
export type RoastLevel = (typeof ROAST_LEVELS)[number];

export const ROAST_LEVEL_DESC: Record<RoastLevel, string> = {
  LIGHT: "Gentle disappointment.",
  SAVAGE: "Professional disrespect.",
  BRUTAL: "Proceed at your own emotional risk.",
  NUCLEAR: "Absolutely unnecessary levels of disrespect.",
  APOCALYPTIC: "We have officially exceeded acceptable emotional damage.",
};

export const DRAMA_LEVELS = [
  "CALM",
  "DRAMATIC",
  "CINEMATIC",
  "MASSIVE",
  "MALAYALAM MOVIE CLIMAX",
] as const;
export type DramaLevel = (typeof DRAMA_LEVELS)[number];

export interface IntakeData {
  userName: string;
  partnerName: string;
  duration: string;
  relationshipType: string;
  situation: string;
  redFlag: string;
  annoyingHabit: string;
  repeatedArgument: string;
  replyTime: string;
  apologizesFirst: string;
  startsArguments: string;
  saysNothing: string;
  leavesUnread: string;
  reason: string;
  roastLevel: RoastLevel;
  dramaLevel: DramaLevel;
  photoName?: string;
  evidenceNames?: string[];
  hearingLanguage: "MALAYALAM" | "MANGLISH";
}

export interface Metric {
  label: string;
  value: number;
  unit?: string;
  note: string;
}
export interface RoastLine {
  label: string;
  text: string;
}
export interface HRMetric {
  label: string;
  stars: number;
  note: string;
}
export interface Charge {
  count: string;
  title: string;
  detail: string;
}
export interface CourtLine {
  role: "PROSECUTION" | "DEFENSE" | "JUDGE" | "COURT";
  text: string;
}
export interface Exhibit {
  id: string;
  title: string;
  roast: string;
}
export interface ReceiptLine {
  item: string;
  qty: string;
  amount: number;
}
export interface RecoveryDay {
  day: string;
  stalking: number;
  typedHey: number;
  sent: number;
  stability: number;
  note: string;
}

export type MediaTag =
  | "GUILTY"
  | "SAVAGE"
  | "ANGRY"
  | "SHOCK"
  | "FUNNY"
  | "DRAMATIC"
  | "VICTORY"
  | "FUNERAL"
  | "NUCLEAR"
  | "FINAL_VERDICT";

export const MEDIA_TAGS: MediaTag[] = [
  "GUILTY",
  "SAVAGE",
  "ANGRY",
  "SHOCK",
  "FUNNY",
  "DRAMATIC",
  "VICTORY",
  "FUNERAL",
  "NUCLEAR",
  "FINAL_VERDICT",
];

export interface MediaItem {
  id: string;
  title: string;
  source: "UPLOAD" | "URL";
  url: string;
  tags: MediaTag[];
}

export interface BreakupCase {
  caseNumber: string;
  createdAt: string;
  intake: IntakeData;
  metrics: Metric[];
  roastReport: RoastLine[];
  hrReport: { metrics: HRMetric[]; status: string; summary: string };
  warning: { violations: string[]; finalWarning: string };
  termination: { body: string[]; severance: string[] };
  charges: Charge[];
  prosecution: { opening: string; exhibits: Exhibit[] };
  defense: CourtLine[];
  objections: string[];
  verdict: { verdict: string; cause: string; emotionalDamage: number };
  sentence: string[];
  autopsy: {
    causeOfDeath: string;
    factors: string[];
    timeOfDeath: string;
    lastWords: string;
  };
  funeral: { years: string; eulogy: string[]; causes: string[] };
  receipt: { lines: ReceiptLine[]; total: number; reason: string };
  damage: Metric[];
  recovery: RecoveryDay[];
  certificate: { reason: string };
  finalRoast: string[];
  malayalamHearing: CourtLine[];
  malayalamJudgment: { intro: string; verdict: string; sentence: string; punchline: string };
  mediaMood: MediaTag[];
}
