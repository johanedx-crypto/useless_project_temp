import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { buildCase, DEMO_INTAKE } from "./engine";
import type { BreakupCase, IntakeData, MediaItem } from "./types";

const CASE_KEY = "baas.case.v1";
const MEDIA_KEY = "baas.media.v1";
const EXIT_KEY = "baas.exit.v1";

interface Store {
  breakupCase: BreakupCase | null;
  isDemo: boolean;
  media: MediaItem[];
  exitAnswers: Record<string, string>;
  submitCase: (intake: IntakeData) => BreakupCase;
  loadDemo: () => BreakupCase;
  resetCase: () => void;
  setExitAnswer: (q: string, a: string) => void;
  addMedia: (item: Omit<MediaItem, "id">) => void;
  removeMedia: (id: string) => void;
}

const Ctx = createContext<Store | null>(null);

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function CaseProvider({ children }: { children: ReactNode }) {
  const [breakupCase, setCase] = useState<BreakupCase | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [exitAnswers, setExit] = useState<Record<string, string>>({});

  // hydrate after mount (no SSR mismatch)
  useEffect(() => {
    const stored = readJSON<{ c: BreakupCase; demo: boolean } | null>(CASE_KEY, null);
    if (stored?.c) {
      setCase(stored.c);
      setIsDemo(Boolean(stored.demo));
    }
    // uploads use blob URLs that die on reload — keep only URL-sourced media
    setMedia(readJSON<MediaItem[]>(MEDIA_KEY, []).filter((m) => m.source === "URL"));
    setExit(readJSON<Record<string, string>>(EXIT_KEY, {}));
  }, []);

  const persistCase = useCallback((c: BreakupCase | null, demo: boolean) => {
    try {
      if (c) window.localStorage.setItem(CASE_KEY, JSON.stringify({ c, demo }));
      else window.localStorage.removeItem(CASE_KEY);
    } catch {
      /* storage full or blocked — the app must never crash for this */
    }
  }, []);

  const submitCase = useCallback(
    (intake: IntakeData) => {
      const c = buildCase(intake);
      setCase(c);
      setIsDemo(false);
      persistCase(c, false);
      return c;
    },
    [persistCase],
  );

  const loadDemo = useCallback(() => {
    const c = buildCase(DEMO_INTAKE);
    setCase(c);
    setIsDemo(true);
    persistCase(c, true);
    return c;
  }, [persistCase]);

  const resetCase = useCallback(() => {
    setCase(null);
    setIsDemo(false);
    setExit({});
    persistCase(null, false);
    try {
      window.localStorage.removeItem(EXIT_KEY);
    } catch {
      /* ignore */
    }
  }, [persistCase]);

  const setExitAnswer = useCallback((q: string, a: string) => {
    setExit((prev) => {
      const next = { ...prev, [q]: a };
      try {
        window.localStorage.setItem(EXIT_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const saveMedia = useCallback((next: MediaItem[]) => {
    setMedia(next);
    try {
      window.localStorage.setItem(
        MEDIA_KEY,
        JSON.stringify(next.filter((m) => m.source === "URL")),
      );
    } catch {
      /* ignore */
    }
  }, []);

  const addMedia = useCallback(
    (item: Omit<MediaItem, "id">) => {
      saveMedia([...media, { ...item, id: `M${Date.now()}${Math.floor(Math.random() * 999)}` }]);
    },
    [media, saveMedia],
  );

  const removeMedia = useCallback(
    (id: string) => saveMedia(media.filter((m) => m.id !== id)),
    [media, saveMedia],
  );

  const value = useMemo<Store>(
    () => ({
      breakupCase,
      isDemo,
      media,
      exitAnswers,
      submitCase,
      loadDemo,
      resetCase,
      setExitAnswer,
      addMedia,
      removeMedia,
    }),
    [
      breakupCase,
      isDemo,
      media,
      exitAnswers,
      submitCase,
      loadDemo,
      resetCase,
      setExitAnswer,
      addMedia,
      removeMedia,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCaseStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCaseStore must be used inside CaseProvider");
  return ctx;
}
