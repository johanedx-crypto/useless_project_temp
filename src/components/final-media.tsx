import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Film, Trash2, Upload, X } from "lucide-react";
import { useCaseStore } from "@/lib/case-store";
import { MEDIA_TAGS, type MediaItem, type MediaTag } from "@/lib/types";
import { Kicker, Panel } from "@/components/kit";
import { cn } from "@/lib/utils";

const MAX_BYTES = 60 * 1024 * 1024;
const OK_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];

export function isDirectVideoUrl(url: string) {
  return /\.(mp4|webm|ogg|ogv|mov)(\?|#|$)/i.test(url);
}

export function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      if (u.pathname.startsWith("/shorts/"))
        return `https://www.youtube.com/embed/${u.pathname.split("/")[2]}`;
      if (u.pathname.startsWith("/embed/")) return u.toString();
    }
    if (host === "youtu.be") return `https://www.youtube.com/embed${u.pathname}`;
    if (host === "vimeo.com")
      return `https://player.vimeo.com/video/${u.pathname.replace(/\//g, "")}`;
    if (host === "player.vimeo.com" || host === "streamable.com") return u.toString();
    return null;
  } catch {
    return null;
  }
}

/** Random, mood-matched clip selection. */
export function selectFinalMedia(media: MediaItem[], mood: MediaTag[]): MediaItem | null {
  if (!media.length) return null;
  const matching = media.filter((m) => m.tags.some((t) => mood.includes(t)));
  const pool = matching.length ? matching : media;
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}

export function MediaLibrary() {
  const { media, addMedia, removeMedia } = useCaseStore();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState<MediaTag[]>(["FINAL_VERDICT"]);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const toggle = (t: MediaTag) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const onFiles = (files: FileList | null) => {
    setError(null);
    const f = files?.[0];
    if (!f) return;
    if (!OK_TYPES.includes(f.type)) {
      setError("Unsupported file. The court accepts MP4, WEBM, OGG or MOV.");
      return;
    }
    if (f.size > MAX_BYTES) {
      setError("File too large. Maximum 60 MB of emotional evidence.");
      return;
    }
    addMedia({
      title: title.trim() || f.name.replace(/\.[^.]+$/, ""),
      source: "UPLOAD",
      url: URL.createObjectURL(f),
      tags: tags.length ? tags : ["FINAL_VERDICT"],
    });
    setTitle("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const onUrl = () => {
    setError(null);
    const v = url.trim();
    if (!v) return;
    if (!/^https?:\/\//i.test(v)) {
      setError("Enter a full https:// link.");
      return;
    }
    if (!isDirectVideoUrl(v) && !toEmbedUrl(v)) {
      setError("THIS VIDEO CANNOT BE EMBEDDED HERE. Try a direct .mp4 link, YouTube or Vimeo.");
      return;
    }
    addMedia({
      title: title.trim() || "Final verdict clip",
      source: "URL",
      url: v,
      tags: tags.length ? tags : ["FINAL_VERDICT"],
    });
    setTitle("");
    setUrl("");
  };

  return (
    <Panel tone="crimson" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Kicker tone="crimson">Media evidence locker</Kicker>
        <span className="label-mono">{media.length} clip(s) filed</span>
      </div>
      <p className="text-sm text-muted-foreground">
        Add your own Malayalam reaction clips. One is chosen at random — matched to the verdict mood
        — and played as the court's final statement. Only upload media you have the right to use.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="label-mono">Clip title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Judge reaction — nuclear"
            className="mt-1 w-full rounded-md border border-input bg-background/70 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="block">
          <span className="label-mono">Video URL (mp4 / YouTube / Vimeo)</span>
          <div className="mt-1 flex gap-2">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              className="w-full rounded-md border border-input bg-background/70 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              type="button"
              onClick={onUrl}
              className="shrink-0 rounded-md border border-accent/50 px-3 py-2 font-mono text-xs uppercase tracking-widest text-accent transition-colors hover:bg-accent/10"
            >
              Add
            </button>
          </div>
        </label>
      </div>

      <div>
        <span className="label-mono">Tags</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {MEDIA_TAGS.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tags.includes(t)}
              onClick={() => toggle(t)}
              className={cn(
                "rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors",
                tags.includes(t)
                  ? "border-primary bg-primary/20 text-foreground"
                  : "border-border text-muted-foreground hover:border-accent/50",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-md border border-accent/50 px-4 py-2 font-mono text-xs uppercase tracking-widest text-accent transition-colors hover:bg-accent/10"
        >
          <Upload className="size-4" aria-hidden /> Upload video file
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="video/mp4,video/webm,video/ogg,video/quicktime"
          className="sr-only"
          onChange={(e) => onFiles(e.target.files)}
          aria-label="Upload video evidence"
        />
        <span className="text-xs text-muted-foreground">MP4 / WEBM / OGG / MOV · max 60 MB</span>
      </div>

      {error ? (
        <p role="alert" className="rounded-md border border-primary/50 bg-primary/10 p-3 text-sm">
          {error}
        </p>
      ) : null}

      {media.length ? (
        <ul className="space-y-2">
          {media.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-card/50 px-3 py-2"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 truncate text-sm">
                  <Film className="size-4 shrink-0 text-accent" aria-hidden />
                  <span className="truncate">{m.title}</span>
                </div>
                <div className="label-mono mt-0.5 truncate">
                  {m.source} · {m.tags.join(" / ")}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeMedia(m.id)}
                aria-label={`Remove ${m.title}`}
                className="rounded-md border border-border p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          The court has no media evidence.
        </p>
      )}
    </Panel>
  );
}

export function FinalMediaModal({
  item,
  onClose,
}: {
  item: MediaItem | null;
  onClose: () => void;
}) {
  const [needsTap, setNeedsTap] = useState(false);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const embed = useMemo(
    () => (item && !isDirectVideoUrl(item.url) ? toEmbedUrl(item.url) : null),
    [item],
  );

  const tryPlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.play()
      .then(() => setNeedsTap(false))
      .catch(() => setNeedsTap(true));
  }, []);

  useEffect(() => {
    if (!item) return;
    setFailed(false);
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(tryPlay, 120);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [item, onClose, tryPlay]);

  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Final verdict media"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/92 p-3 backdrop-blur-md"
    >
      <div className="w-full max-w-3xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="label-mono text-accent">The court has spoken.</p>
            <h3 className="font-display text-2xl sm:text-3xl">Final verdict media</h3>
            <p className="mt-1 truncate text-xs text-muted-foreground">{item.title}</p>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close final verdict media"
            className="rounded-md border border-border p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="overflow-hidden rounded-lg border border-primary/40 bg-black shadow-[var(--shadow-cinematic)]">
          {failed ? (
            <p className="p-8 text-center font-mono text-sm uppercase tracking-widest">
              This video cannot be embedded here.
            </p>
          ) : embed ? (
            <iframe
              src={embed}
              title={item.title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="aspect-video w-full"
            />
          ) : (
            <video
              ref={videoRef}
              src={item.url}
              controls
              playsInline
              className="aspect-video w-full bg-black"
              onError={() => setFailed(true)}
            />
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {!embed && !failed ? (
            <button
              onClick={tryPlay}
              className="rounded-md bg-primary px-4 py-2 font-mono text-xs uppercase tracking-widest text-primary-foreground"
            >
              {needsTap ? "Play the final verdict" : "Replay"}
            </button>
          ) : null}
          <button
            onClick={onClose}
            className="rounded-md border border-accent/50 px-4 py-2 font-mono text-xs uppercase tracking-widest text-accent transition-colors hover:bg-accent/10"
          >
            Continue to case closed
          </button>
        </div>
      </div>
    </div>
  );
}
