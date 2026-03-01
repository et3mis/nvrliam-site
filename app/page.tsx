"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  ArrowUpRight,
  Boxes,
  Check,
  Cpu,
  Gamepad2,
  Mail,
  MessageCircle,
  Music2,
  Rocket,
  Search,
  Volume2,
  VolumeX,
  Wrench,
  X,
} from "lucide-react";

type Panel = "none" | "showcase" | "commission";
type NavTab = "home" | "showcase" | "commission";
type DiscordPresence = "online" | "idle" | "dnd" | "offline";

type ShowcaseItem = {
  title: string;
  embed: string;
  desc: string;
};

type BigShowcaseItem = {
  title: string;
  embed: string;
  credits: string;
  bio: string;
};

type SkillItem = {
  label: string;
  mark: string;
  tone: string;
};

type PriceTier = {
  title: string;
  usd: string;
  robux: string;
  note: string;
  icon: "fix" | "mini" | "play" | "full" | "game";
};

type ParticleDot = {
  left: string;
  top: string;
  leftPct: number;
  topPct: number;
  size: number;
  opacity: number;
  delay: string;
  duration: string;
  dx: number;
  dy: number;
  blur: number;
  phase: number;
};

type CSSVars = CSSProperties & {
  "--blur"?: string;
  "--opacity-base"?: number | string;
};

const DISCORD_USER_ID = "1404955716887904266";
const DISCORD_STATUS_ENABLED = /^\d{8,25}$/.test(DISCORD_USER_ID);
const DISCORD_POLL_MS = 30000;

const INITIAL_BOOT_MS = 900;
const PANEL_EXIT_MS = 240;
const BG_MUSIC_SRC = "/portfolio-music.mp3";
const BG_MUSIC_VOLUME = 0.18;
const EMAIL_ADDRESS = "liamj7872@gmail.com";
const DISCORD_INVITE = "https://discord.gg/62nWRxRs";

const avatarFallback = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="60" fill="#111"/>
    <text
      x="50%"
      y="54%"
      dominant-baseline="middle"
      text-anchor="middle"
      fill="white"
      font-family="Arial, sans-serif"
      font-size="42"
      font-weight="700"
    >
      LJ
    </text>
  </svg>
`)}`;

const avatarSources = ["/profile.png", "/logo.png", avatarFallback] as const;

const skills: SkillItem[] = [
  { label: "Lua - Fluent", mark: "Lu", tone: "lua" },
  { label: "JavaScript - Fluent", mark: "JS", tone: "js" },
  { label: "C++ - Fluent", mark: "C+", tone: "cpp" },
  { label: "C# - Intermediate", mark: "C#", tone: "cs" },
  { label: "Python - Apprentice", mark: "Py", tone: "py" },
];

const showcases: ShowcaseItem[] = [
  { title: "R6 Movement", embed: "https://streamable.com/e/4d1k8n?autoplay=0&loop=0", desc: "Run, jump, smooth FOV." },
  { title: "Stamina Sprint", embed: "https://streamable.com/e/ea1hrw?autoplay=0&loop=0", desc: "Sprint, stamina, UI." },
  { title: "Interactive System", embed: "https://streamable.com/e/gwtmws?autoplay=0&loop=0", desc: "Prompt and interaction flow." },
  { title: "Round System", embed: "https://streamable.com/e/1sgsoz?autoplay=0&loop=0", desc: "Voting, round loop, teleports." },
  { title: "Gun System", embed: "https://streamable.com/e/am7pzp?autoplay=0&loop=0", desc: "Gun logic and reload." },
  { title: "Death System", embed: "https://streamable.com/e/t4c8oj?autoplay=0&loop=0", desc: "Death flow and anti-fling." },
  { title: "TD Pathing", embed: "https://streamable.com/e/lqy3i9?autoplay=0&loop=0", desc: "Checkpoint pathing and overheads." },
  { title: "NPC Dialogue", embed: "https://streamable.com/e/edelsf?autoplay=0&loop=0", desc: "Monologue and dialogue setup." },
  { title: "Admin Panel", embed: "https://streamable.com/e/fnehz2?autoplay=0&loop=0", desc: "Admin UI and commands." },
];

const bigShowcases: BigShowcaseItem[] = [
  {
    title: "DYNAMIC MOVEMENT SYSTEM",
    embed: "https://streamable.com/e/8nqqaa?autoplay=0&loop=0",
    credits: "Credits: SkaterStudios ( HELPED ) & nvrliam ( ME )",
    bio: "Premium movement polish built to stay smooth, responsive, and stable in real gameplay.",
  },
];

const prices: PriceTier[] = [
  { title: "Quick Fixes", usd: "$5–$15", robux: "1.4k–4.3k R$", note: "Small fixes and targeted tweaks.", icon: "fix" },
  { title: "Mini Scripts", usd: "$15–$35", robux: "4.3k–10k R$", note: "Small drop-in features.", icon: "mini" },
  { title: "Gameplay Features", usd: "$35–$80", robux: "10k–23k R$", note: "Mid-size systems.", icon: "play" },
  { title: "Full Systems", usd: "$80–$180", robux: "23k–51k R$", note: "Bigger polished systems.", icon: "full" },
  { title: "Full Game", usd: "$250+", robux: "71k+ R$", note: "Quote depends on scope.", icon: "game" },
];

function createParticleDots(count = 84): ParticleDot[] {
  return Array.from({ length: count }, (_, i) => {
    const leftPct = 1 + ((i * 17) % 98);
    const topPct = 2 + ((i * 23) % 94);
    const size = 2 + (i % 5);
    const opacity = Math.min(0.22 + (i % 7) * 0.09, 0.9);
    const dx = Number((((i % 11) - 5) * (0.55 + (i % 3) * 0.18)).toFixed(2));
    const dy = Number((((((i + 4) % 11) - 5) || 1) * (0.5 + (i % 4) * 0.16)).toFixed(2));
    const blur = Math.max(0, (size - 2) * 0.45);
    const phase = Number((i * 0.37).toFixed(3));

    return {
      left: `${leftPct}%`,
      top: `${topPct}%`,
      leftPct,
      topPct,
      size,
      opacity,
      delay: `${(i % 12) * 0.18}s`,
      duration: `${4.6 + (i % 9) * 0.7}s`,
      dx,
      dy,
      blur,
      phase,
    };
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function waitForPageLoad() {
  if (document.readyState === "complete") return Promise.resolve();

  return new Promise<void>((resolve) => {
    window.addEventListener("load", () => resolve(), { once: true });
  });
}

function waitForFonts() {
  const fonts = (document as Document & { fonts?: { ready?: Promise<unknown> } }).fonts;
  if (!fonts?.ready) return Promise.resolve();
  return fonts.ready.then(() => undefined).catch(() => undefined);
}

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

function preloadAudio(src: string) {
  return new Promise<void>((resolve) => {
    const audio = document.createElement("audio");
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      cleanup();
      resolve();
    };

    const cleanup = () => {
      window.clearTimeout(timeoutId);
      audio.removeEventListener("canplaythrough", finish);
      audio.removeEventListener("loadeddata", finish);
      audio.removeEventListener("error", finish);
      audio.src = "";
    };

    const timeoutId = window.setTimeout(finish, 1400);

    audio.preload = "auto";
    audio.addEventListener("canplaythrough", finish, { once: true });
    audio.addEventListener("loadeddata", finish, { once: true });
    audio.addEventListener("error", finish, { once: true });
    audio.src = src;
    audio.load();
  });
}

function fallbackCopy(text: string) {
  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "true");
  input.style.position = "fixed";
  input.style.opacity = "0";
  input.style.pointerEvents = "none";
  document.body.appendChild(input);
  input.focus();
  input.select();

  let copied = false;

  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }

  document.body.removeChild(input);
  return copied;
}

function getVideoUrl(embed: string) {
  return embed.replace("https://streamable.com/e/", "https://streamable.com/").replace(/\?.*$/, "");
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function TierIcon({ icon }: { icon: PriceTier["icon"] }) {
  if (icon === "fix") return <Wrench className="mini" />;
  if (icon === "mini") return <Boxes className="mini" />;
  if (icon === "play") return <Gamepad2 className="mini" />;
  if (icon === "full") return <Cpu className="mini" />;
  return <Rocket className="mini" />;
}

export default function PortfolioPage() {
  const [panel, setPanel] = useState<Panel>("none");
  const [activeTab, setActiveTab] = useState<NavTab>("home");
  const [panelClosing, setPanelClosing] = useState(false);
  const [panelRenderKey, setPanelRenderKey] = useState(0);
  const [query, setQuery] = useState("");
  const [emailCopied, setEmailCopied] = useState(false);
  const [discordStatus, setDiscordStatus] = useState<DiscordPresence>(DISCORD_STATUS_ENABLED ? "offline" : "online");
  const [statusLoaded, setStatusLoaded] = useState(!DISCORD_STATUS_ENABLED);
  const [pageReady, setPageReady] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [musicUnlocked, setMusicUnlocked] = useState(false);
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [loadedVideos, setLoadedVideos] = useState<Record<string, boolean>>({});

  const shellRef = useRef<HTMLDivElement | null>(null);
  const particleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const copyTimerRef = useRef<number | null>(null);
  const fadeFrameRef = useRef<number | null>(null);
  const panelCloseTimerRef = useRef<number | null>(null);

  const particleDots = useMemo(() => createParticleDots(84), []);

  const preloadTargets = useMemo(() => {
    const values = [
      ...showcases.slice(0, 5).map((item) => item.embed),
      ...showcases.slice(0, 5).map((item) => getVideoUrl(item.embed)),
      ...bigShowcases.map((item) => item.embed),
      ...bigShowcases.map((item) => getVideoUrl(item.embed)),
    ];

    return Array.from(new Set(values));
  }, []);

  const openPanel = useCallback((next: Exclude<Panel, "none">) => {
    if (panelCloseTimerRef.current !== null) {
      window.clearTimeout(panelCloseTimerRef.current);
      panelCloseTimerRef.current = null;
    }

    setActiveTab(next);
    setPanelClosing(false);
    setPanel(next);
    setPanelRenderKey((prev) => prev + 1);
  }, []);

  const showHome = useCallback(() => {
    if (panelCloseTimerRef.current !== null) {
      window.clearTimeout(panelCloseTimerRef.current);
      panelCloseTimerRef.current = null;
    }

    setActiveTab("home");

    if (panel === "none" || panelClosing) {
      return;
    }

    setPanelClosing(true);

    panelCloseTimerRef.current = window.setTimeout(() => {
      setPanel("none");
      setPanelClosing(false);
      panelCloseTimerRef.current = null;
    }, PANEL_EXIT_MS);
  }, [panel, panelClosing]);

  const markVideoLoaded = useCallback((key: string) => {
    setLoadedVideos((prev) => {
      if (prev[key]) return prev;
      return { ...prev, [key]: true };
    });
  }, []);

  const copyEmail = useCallback(async () => {
    let copied = false;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(EMAIL_ADDRESS);
        copied = true;
      } else {
        copied = fallbackCopy(EMAIL_ADDRESS);
      }
    } catch {
      copied = fallbackCopy(EMAIL_ADDRESS);
    }

    if (!copied) {
      setEmailCopied(false);
      return;
    }

    setEmailCopied(true);

    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }

    copyTimerRef.current = window.setTimeout(() => {
      setEmailCopied(false);
    }, 1200);
  }, []);

  const filteredShowcases = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return showcases;

    return showcases.filter(
      (item) =>
        item.title.toLowerCase().includes(value) ||
        item.desc.toLowerCase().includes(value),
    );
  }, [query]);

  const statusText = useMemo(() => {
    if (!statusLoaded) return "Checking status...";
    if (discordStatus === "online") return "Available now";
    if (discordStatus === "idle") return "Away right now";
    if (discordStatus === "dnd") return "Busy right now";
    return "Offline";
  }, [discordStatus, statusLoaded]);

  useEffect(() => {
    let active = true;

    const boot = async () => {
      await Promise.allSettled([
        waitForPageLoad(),
        waitForFonts(),
        preloadImage("/profile.png"),
        preloadImage("/logo.png"),
        preloadAudio(BG_MUSIC_SRC),
        sleep(INITIAL_BOOT_MS),
      ]);

      if (!active) return;

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          if (active) setPageReady(true);
        });
      });
    };

    void boot();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const links: HTMLLinkElement[] = [];

    const addLink = (props: {
      rel: string;
      href: string;
      as?: string;
      crossOrigin?: string;
    }) => {
      const link = document.createElement("link");
      link.rel = props.rel;
      link.href = props.href;

      if (props.as) link.as = props.as;
      if (props.crossOrigin !== undefined) link.crossOrigin = props.crossOrigin;

      document.head.appendChild(link);
      links.push(link);
    };

    addLink({ rel: "preconnect", href: "https://streamable.com", crossOrigin: "anonymous" });
    addLink({ rel: "preconnect", href: "https://api.lanyard.rest", crossOrigin: "anonymous" });
    addLink({ rel: "preconnect", href: "https://discord.gg", crossOrigin: "anonymous" });
    addLink({ rel: "preconnect", href: "https://discord.com", crossOrigin: "anonymous" });
    addLink({ rel: "dns-prefetch", href: "https://streamable.com" });
    addLink({ rel: "dns-prefetch", href: "https://api.lanyard.rest" });
    addLink({ rel: "preload", href: "/profile.png", as: "image" });
    addLink({ rel: "preload", href: "/logo.png", as: "image" });
    addLink({ rel: "preload", href: BG_MUSIC_SRC, as: "audio" });

    for (const href of preloadTargets) {
      addLink({ rel: "prefetch", href });
    }

    return () => {
      for (const link of links) {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      }
    };
  }, [preloadTargets]);

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const motionFactor = reduceMotion ? 0.32 : 1;
    const particleFactor = reduceMotion ? 0.32 : 1;
    const easeFactor = reduceMotion ? 0.055 : 0.095;

    const state = {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
      cursorX: 0,
      cursorY: 0,
      cursorActive: false,
      left: 0,
      top: 0,
      width: 1,
      height: 1,
      raf: 0,
    };

    const updateRect = () => {
      const rect = el.getBoundingClientRect();
      state.left = rect.left;
      state.top = rect.top;
      state.width = Math.max(rect.width, 1);
      state.height = Math.max(rect.height, 1);
    };

    const setCursorVars = (xPercent: number, yPercent: number) => {
      el.style.setProperty("--cx", `${xPercent.toFixed(2)}%`);
      el.style.setProperty("--cy", `${yPercent.toFixed(2)}%`);
    };

    const syncFromClientPoint = (clientX: number, clientY: number) => {
      updateRect();

      const localX = clamp(clientX - state.left, 0, state.width);
      const localY = clamp(clientY - state.top, 0, state.height);

      state.targetX = (localX / state.width - 0.5) * 2;
      state.targetY = (localY / state.height - 0.5) * 2;
      state.cursorX = localX;
      state.cursorY = localY;
      state.cursorActive = true;

      setCursorVars((localX / state.width) * 100, (localY / state.height) * 100);
    };

    const resetMotion = () => {
      state.targetX = 0;
      state.targetY = 0;
      state.cursorActive = false;
      setCursorVars(50, 34);
    };

    const frame = (now: number) => {
      state.currentX += (state.targetX - state.currentX) * easeFactor;
      state.currentY += (state.targetY - state.currentY) * easeFactor;

      const renderX = state.currentX * motionFactor;
      const renderY = state.currentY * motionFactor;

      el.style.setProperty("--mx", renderX.toFixed(4));
      el.style.setProperty("--my", renderY.toFixed(4));

      const t = now * 0.001;
      const repelRadius = Math.min(190, Math.max(120, state.width * 0.15));
      const repelStrength = reduceMotion ? 12 : 42;

      for (const node of particleRefs.current) {
        if (!node) continue;

        const baseDx = Number(node.dataset.dx ?? 0);
        const baseDy = Number(node.dataset.dy ?? 0);
        const leftPct = Number(node.dataset.leftpct ?? 50);
        const topPct = Number(node.dataset.toppct ?? 50);
        const phase = Number(node.dataset.phase ?? 0);
        const size = Number(node.dataset.size ?? 3);

        const dotX = (leftPct / 100) * state.width;
        const dotY = (topPct / 100) * state.height;

        const driftX = renderX * 20 * baseDx;
        const driftY = renderY * 20 * baseDy;

        const ambientX = Math.sin(t * (0.46 + size * 0.022) + phase) * (2.9 + size * 0.62) * particleFactor;
        const ambientY = Math.cos(t * (0.61 + size * 0.026) + phase) * (2.5 + size * 0.58) * particleFactor;

        let repelX = 0;
        let repelY = 0;

        if (state.cursorActive) {
          const vx = dotX - state.cursorX;
          const vy = dotY - state.cursorY;
          const dist = Math.hypot(vx, vy) || 0.001;

          if (dist < repelRadius) {
            const force = Math.pow(1 - dist / repelRadius, 2) * repelStrength;
            repelX = (vx / dist) * force;
            repelY = (vy / dist) * force;
          }
        }

        node.style.transform = `translate3d(${(driftX + ambientX + repelX).toFixed(2)}px, ${(driftY + ambientY + repelY).toFixed(2)}px, 0)`;
      }

      state.raf = window.requestAnimationFrame(frame);
    };

    const supportsPointer = "PointerEvent" in window;

    const handlePointerMove: EventListener = (event) => {
      const e = event as PointerEvent;
      syncFromClientPoint(e.clientX, e.clientY);
    };

    const handleMouseMove: EventListener = (event) => {
      const e = event as MouseEvent;
      syncFromClientPoint(e.clientX, e.clientY);
    };

    const handleTouchMove: EventListener = (event) => {
      const e = event as TouchEvent;
      const touch = e.touches[0];
      if (!touch) return;
      syncFromClientPoint(touch.clientX, touch.clientY);
    };

    const handleReset: EventListener = () => {
      resetMotion();
    };

    const handleResizeOrScroll: EventListener = () => {
      updateRect();
    };

    updateRect();
    setCursorVars(50, 34);
    state.raf = window.requestAnimationFrame(frame);

    if (supportsPointer) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
    } else {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
    }

    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleReset, { passive: true });
    window.addEventListener("touchcancel", handleReset, { passive: true });
    window.addEventListener("blur", handleReset);
    window.addEventListener("resize", handleResizeOrScroll);
    window.addEventListener("scroll", handleResizeOrScroll, { passive: true });

    return () => {
      if (supportsPointer) {
        window.removeEventListener("pointermove", handlePointerMove);
      } else {
        window.removeEventListener("mousemove", handleMouseMove);
      }

      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleReset);
      window.removeEventListener("touchcancel", handleReset);
      window.removeEventListener("blur", handleReset);
      window.removeEventListener("resize", handleResizeOrScroll);
      window.removeEventListener("scroll", handleResizeOrScroll);
      window.cancelAnimationFrame(state.raf);
    };
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = panel === "none" ? "" : "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [panel]);

  useEffect(() => {
    if (panel !== "showcase") {
      setQuery("");
      return;
    }

    setLoadedVideos({});

    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 140);

    return () => {
      window.clearTimeout(timer);
    };
  }, [panel, panelRenderKey]);

  useEffect(() => {
    if (panel === "none") return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        showHome();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [panel, showHome]);

  useEffect(() => {
    if (!DISCORD_STATUS_ENABLED) return;

    let cancelled = false;
    let timer = 0;
    let controller: AbortController | null = null;

    const requestStatus = async (signal: AbortSignal): Promise<DiscordPresence> => {
      const localController = new AbortController();

      const abortFromParent = () => {
        localController.abort();
      };

      signal.addEventListener("abort", abortFromParent, { once: true });

      const timeoutId = window.setTimeout(() => {
        localController.abort();
      }, 4500);

      try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`, {
          cache: "no-store",
          signal: localController.signal,
          headers: {
            Accept: "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch Discord status");
        }

        const data = (await res.json()) as {
          data?: {
            discord_status?: string;
          };
        };

        const raw = String(data?.data?.discord_status ?? "offline").toLowerCase();

        if (raw === "online" || raw === "idle" || raw === "dnd") {
          return raw;
        }

        return "offline";
      } finally {
        window.clearTimeout(timeoutId);
        signal.removeEventListener("abort", abortFromParent);
      }
    };

    const poll = async () => {
      controller?.abort();

      const currentController = new AbortController();
      controller = currentController;

      try {
        const nextStatus = await requestStatus(currentController.signal);

        if (cancelled || currentController.signal.aborted) return;

        setDiscordStatus(nextStatus);
        setStatusLoaded(true);
      } catch {
        if (cancelled || currentController.signal.aborted) return;

        setStatusLoaded(true);
      } finally {
        if (!cancelled) {
          timer = window.setTimeout(() => {
            void poll();
          }, DISCORD_POLL_MS);
        }
      }
    };

    void poll();

    const onVisibility = () => {
      if (!document.hidden) {
        void poll();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      controller?.abort();
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let disposed = false;
    let pauseTimer: number | null = null;

    const clearPauseTimer = () => {
      if (pauseTimer !== null) {
        window.clearTimeout(pauseTimer);
        pauseTimer = null;
      }
    };

    const cancelFade = () => {
      if (fadeFrameRef.current !== null) {
        window.cancelAnimationFrame(fadeFrameRef.current);
        fadeFrameRef.current = null;
      }
    };

    const fadeVolume = (from: number, to: number, duration: number) => {
      cancelFade();

      const start = performance.now();

      const tick = (now: number) => {
        if (disposed) return;

        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        audio.volume = from + (to - from) * eased;

        if (progress < 1) {
          fadeFrameRef.current = window.requestAnimationFrame(tick);
        } else {
          fadeFrameRef.current = null;
        }
      };

      fadeFrameRef.current = window.requestAnimationFrame(tick);
    };

    const startMusic = () => {
      if (!musicEnabled || disposed) return;

      clearPauseTimer();

      if (!audio.paused) {
        setMusicUnlocked(true);
        fadeVolume(audio.volume, BG_MUSIC_VOLUME, 240);
        return;
      }

      audio.muted = false;

      if (audio.volume <= 0) {
        audio.volume = 0.001;
      }

      const playPromise = audio.play();

      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(() => {
            if (disposed) return;
            setMusicUnlocked(true);
            fadeVolume(Math.max(audio.volume, 0.001), BG_MUSIC_VOLUME, 520);
          })
          .catch(() => {
            if (disposed) return;
            setMusicUnlocked(false);
          });
      } else {
        setMusicUnlocked(true);
        fadeVolume(Math.max(audio.volume, 0.001), BG_MUSIC_VOLUME, 520);
      }
    };

    const stopMusic = () => {
      clearPauseTimer();

      if (audio.paused && audio.volume <= 0.001) {
        return;
      }

      fadeVolume(audio.volume, 0, 300);

      pauseTimer = window.setTimeout(() => {
        if (disposed) return;
        audio.pause();
        audio.currentTime = 0;
      }, 320);
    };

    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;
    audio.load();

    if (musicEnabled) {
      startMusic();
    } else {
      stopMusic();
    }

    const unlock = () => {
      if (!musicEnabled) return;
      startMusic();
    };

    const onVisibility = () => {
      if (document.hidden) {
        stopMusic();
        return;
      }

      if (musicEnabled) {
        startMusic();
      }
    };

    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      clearPauseTimer();
      cancelFade();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [musicEnabled]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }

      if (fadeFrameRef.current !== null) {
        window.cancelAnimationFrame(fadeFrameRef.current);
      }

      if (panelCloseTimerRef.current !== null) {
        window.clearTimeout(panelCloseTimerRef.current);
      }
    };
  }, []);

  return (
    <main className={`page-shell ${pageReady ? "ready" : "booting"}`} ref={shellRef}>
      <audio ref={audioRef} src={BG_MUSIC_SRC} aria-hidden="true" playsInline />

      <div className="bg-aurora aurora-layer" />
      <div className="bg-beams beams-layer" />
      <div className="bg-depth depth-layer" />
      <div className="bg-spotlight spotlight-layer" />
      <div className="bg-grid grid-layer" />
      <div className="bg-network network-layer" />

      <div className="bg-sword-wrap sword-layer" aria-hidden="true">
        <div className="sword-stage">
          <div className="sword-aura aura-1" />
          <div className="sword-aura aura-2" />
          <div className="sword-ring ring-1" />
          <div className="sword-ring ring-2" />
          <div className="sword-glow" />

          <div className="sword">
            <span className="blade" />
            <span className="blade-shine" />
            <span className="edge" />
            <span className="guard" />
            <span className="grip" />
            <span className="pommel" />
          </div>
        </div>
      </div>

      <div className="bg-particles" aria-hidden="true">
        {particleDots.map((dot, index) => (
          <span
            key={`${dot.left}-${dot.top}-${index}`}
            ref={(el) => {
              particleRefs.current[index] = el;
            }}
            className="dynamic-particle"
            data-dx={dot.dx}
            data-dy={dot.dy}
            data-leftpct={dot.leftPct}
            data-toppct={dot.topPct}
            data-phase={dot.phase}
            data-size={dot.size}
            style={
              {
                left: dot.left,
                top: dot.top,
                width: `${dot.size}px`,
                height: `${dot.size}px`,
                animationDelay: dot.delay,
                animationDuration: dot.duration,
                "--blur": `${dot.blur}px`,
                "--opacity-base": dot.opacity,
              } as CSSVars
            }
          />
        ))}
      </div>

      {!pageReady && (
        <div className="page-loader" aria-hidden="true">
          <div className="page-loader-card">
            <Music2 className="mini loader-icon" />
            <span className="page-loader-text">Loading...</span>
            <span className="page-loader-dots">
              <span />
              <span />
              <span />
            </span>
          </div>
        </div>
      )}

      <header className="top-stack reveal">
        <div className="top-center">
          <nav className="nav-shell" aria-label="Main">
            <button
              type="button"
              className={`tab-btn ${activeTab === "home" ? "is-active" : ""}`}
              onClick={showHome}
            >
              Home
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "showcase" ? "is-active" : ""}`}
              onClick={() => openPanel("showcase")}
            >
              Showcase
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "commission" ? "is-active" : ""}`}
              onClick={() => openPanel("commission")}
            >
              Commission Me
            </button>
          </nav>

          <div className="top-profile">
            <img
              src={avatarSources[avatarIndex]}
              alt="Profile"
              className="avatar"
              loading="eager"
              decoding="async"
              onError={() => {
                setAvatarIndex((prev) => (prev < avatarSources.length - 1 ? prev + 1 : prev));
              }}
            />
            <div className={`badge badge-${discordStatus}`}>
              <span className="dot" />
              {statusText}
            </div>
          </div>
        </div>
      </header>

      <div className="wrap">
        <section className="hero">
          <p className="intro reveal delay-1">Liam • Roblox scripter</p>

          <h1 className="hero-title reveal delay-2">
            Built for real games.
            <span className="hero-accent">Clean systems. Reliable delivery.</span>
          </h1>

          <p className="hero-copy reveal delay-2">
            I build Roblox systems that stay organized, perform well, and hold up under real use.
          </p>

          <div className="status-row reveal delay-2">
            <span className="status-pill">Commissions Open</span>
            <span className="status-pill">Queue 0 / 3</span>
            <span className="status-pill">Fast replies</span>
            <button
              type="button"
              className={`status-pill music-pill ${musicEnabled ? "music-on" : "music-off"}`}
              onClick={() => setMusicEnabled((prev) => !prev)}
              aria-pressed={musicEnabled}
            >
              {musicEnabled ? <Volume2 className="mini" /> : <VolumeX className="mini" />}
              {musicEnabled ? (musicUnlocked ? "Music On" : "Music Ready") : "Music Off"}
            </button>
          </div>

          <div className="discord-callout reveal delay-3">
            <span>JOIN DISCORD SERVER FOR FULL PORTFOLIO</span>
            <a href={DISCORD_INVITE} target="_blank" rel="noreferrer" className="discord-callout-btn">
              Join Server
            </a>
          </div>

          <div className="stat-row reveal delay-3">
            <div className="stat-pill stat-big">
              <strong>2M+</strong>
              <span>community reach</span>
            </div>
            <div className="stat-pill stat-big">
              <strong>4B+</strong>
              <span>contributed visits</span>
            </div>
            <div className="stat-pill stat-big">
              <strong>AAA</strong>
              <span>execution</span>
            </div>
          </div>

          <div className="cred-row reveal delay-3">
            <span className="cred-pill">Organized explorer structure</span>
            <span className="cred-pill">Reliable under load</span>
            <span className="cred-pill">Clean, maintainable code</span>
          </div>

          <div className="cta-row reveal delay-3">
            <button type="button" className="main-btn" onClick={() => openPanel("showcase")}>
              View Showcase
              <ArrowUpRight className="mini" />
            </button>
            <button type="button" className="ghost-btn" onClick={() => openPanel("commission")}>
              Commission Me
            </button>
          </div>

          <div className="skills reveal delay-3">
            {skills.map((skill) => (
              <span key={skill.label} className={`skill-pill tone-${skill.tone}`}>
                <span className={`skill-mark ${skill.tone}`}>{skill.mark}</span>
                {skill.label}
              </span>
            ))}
          </div>
        </section>
      </div>

      {panel !== "none" && (
        <div className={`overlay ${panelClosing ? "overlay-closing" : "overlay-open"}`} onClick={showHome}>
          <section
            key={`${panel}-${panelRenderKey}`}
            className={`panel ${panel === "showcase" ? "panel-showcase" : "panel-commission"} ${panelClosing ? "panel-closing" : "panel-opening"}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={panel === "showcase" ? "Showcase" : "Commission me"}
          >
            <div className="panel-sheen" />

            {panel === "showcase" ? (
              <>
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">Portfolio</p>
                    <h2>Showcase</h2>
                  </div>
                  <button type="button" className="close-btn" onClick={showHome} aria-label="Close">
                    <X className="mini" />
                  </button>
                </div>

                <div className="toolbar-row">
                  <div className="search-shell">
                    <Search className="mini search-icon" />
                    <input
                      ref={searchInputRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search systems..."
                      className="search-input"
                      aria-label="Search showcase"
                    />
                  </div>
                  <div className="toolbar-meta">{filteredShowcases.length} systems</div>
                </div>

                <div className="video-grid">
                  {filteredShowcases.length > 0 ? (
                    filteredShowcases.map((item, index) => {
                      const key = `main-${item.embed}`;
                      const isLoaded = !!loadedVideos[key];

                      return (
                        <article key={item.embed} className={`video-card reveal delay-${(index % 3) + 1}`}>
                          <div className={`video-frame-shell ${isLoaded ? "is-loaded" : ""}`}>
                            <div className="video-skeleton">
                              <span />
                              <span />
                              <span />
                            </div>

                            <iframe
                              title={item.title}
                              src={item.embed}
                              className="video-frame"
                              allow="autoplay; fullscreen; picture-in-picture"
                              allowFullScreen
                              loading={index < 5 ? "eager" : "lazy"}
                              referrerPolicy="strict-origin-when-cross-origin"
                              onLoad={() => markVideoLoaded(key)}
                            />
                          </div>

                          <h3>{item.title}</h3>
                          <p>{item.desc}</p>

                          <div className="video-actions">
                            <a href={getVideoUrl(item.embed)} target="_blank" rel="noreferrer" className="video-open-btn">
                              Open Video
                            </a>
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <div className="empty-card">
                      <h3>No matches</h3>
                      <p>Try a different keyword.</p>
                    </div>
                  )}
                </div>

                <section className="big-showcase-section">
                  <div className="section-heading">
                    <h3>FEATURED SYSTEMS</h3>
                  </div>

                  <div className="big-showcase-list">
                    {bigShowcases.map((item, index) => {
                      const key = `big-${item.embed}`;
                      const isLoaded = !!loadedVideos[key];

                      return (
                        <article key={item.embed} className={`big-showcase-card reveal delay-${(index % 3) + 1}`}>
                          <div className={`video-frame-shell big-shell ${isLoaded ? "is-loaded" : ""}`}>
                            <div className="video-skeleton">
                              <span />
                              <span />
                              <span />
                            </div>

                            <iframe
                              title={item.title}
                              src={item.embed}
                              className="video-frame"
                              allow="autoplay; fullscreen; picture-in-picture"
                              allowFullScreen
                              loading="eager"
                              referrerPolicy="strict-origin-when-cross-origin"
                              onLoad={() => markVideoLoaded(key)}
                            />
                          </div>

                          <div className="big-showcase-copy">
                            <h4>{item.title}</h4>
                            <p>{item.credits}</p>
                            <p className="big-bio">{item.bio}</p>

                            <div className="video-actions">
                              <a href={getVideoUrl(item.embed)} target="_blank" rel="noreferrer" className="video-open-btn">
                                Open Video
                              </a>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              </>
            ) : (
              <>
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">Commission</p>
                    <h2>Commission Me</h2>
                  </div>
                  <button type="button" className="close-btn" onClick={showHome} aria-label="Close">
                    <X className="mini" />
                  </button>
                </div>

                <div className="pricing-list">
                  {prices.map((item) => (
                    <div key={item.title} className="tier-card">
                      <div className="tier-head">
                        <div className="tier-title-wrap">
                          <span className="tier-icon">
                            <TierIcon icon={item.icon} />
                          </span>
                          <h3>{item.title}</h3>
                        </div>
                        <span className="tier-price">{item.usd}</span>
                      </div>
                      <div className="tier-meta">{item.robux}</div>
                      <p>{item.note}</p>
                    </div>
                  ))}
                </div>

                <div className="commission-grid">
                  <div className="info-card">
                    <h3>Terms</h3>
                    <ul>
                      <li>50% upfront, 50% on delivery</li>
                      <li>1–2 free revisions</li>
                      <li>Rush work is +10%</li>
                      <li>7 days of bug fixes after delivery</li>
                    </ul>
                  </div>

                  <div className="info-card">
                    <h3>Why this holds up</h3>
                    <ul>
                      <li>Clean structure that stays readable</li>
                      <li>Player-facing polish that looks premium</li>
                      <li>Better handling of edge cases and real use</li>
                    </ul>
                  </div>
                </div>

                <div className="policy-grid">
                  <div className="policy-card">
                    <div className="policy-icon">
                      <Check className="mini" />
                    </div>
                    <h4>Clean</h4>
                    <p>Built to stay organized.</p>
                  </div>
                  <div className="policy-card">
                    <div className="policy-icon">
                      <Check className="mini" />
                    </div>
                    <h4>Stable</h4>
                    <p>Made to hold up under pressure.</p>
                  </div>
                  <div className="policy-card">
                    <div className="policy-icon">
                      <Check className="mini" />
                    </div>
                    <h4>Premium</h4>
                    <p>Presentation that feels high-end.</p>
                  </div>
                </div>

                <div className="contact-actions">
                  <button type="button" className="commission-cta" onClick={copyEmail}>
                    <Mail className="mini" />
                    {emailCopied ? "Copied" : "Email"}
                  </button>
                  <a href="https://discord.com/app" target="_blank" rel="noreferrer" className="commission-ghost">
                    <MessageCircle className="mini" />
                    Discord
                  </a>
                  <a href={DISCORD_INVITE} target="_blank" rel="noreferrer" className="commission-ghost">
                    Server
                  </a>
                </div>
              </>
            )}
          </section>
        </div>
      )}

      <style jsx global>{`
        html,
        body {
          background: #000;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.16) rgba(255, 255, 255, 0.03);
        }

        body::-webkit-scrollbar {
          width: 10px;
        }

        body::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.03);
        }

        body::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.16);
          border-radius: 999px;
        }
      `}</style>

      <style jsx>{`
        .page-shell {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background:
            radial-gradient(circle at 50% 0%, #090909 0%, #040404 34%, #000 100%);
          color: #fff;
          isolation: isolate;
          perspective: 1400px;
          --mx: 0;
          --my: 0;
          --cx: 50%;
          --cy: 34%;
        }

        .page-shell.booting .top-stack,
        .page-shell.booting .wrap {
          opacity: 0;
          pointer-events: none;
        }

        .page-shell.ready .top-stack,
        .page-shell.ready .wrap {
          opacity: 1;
          transition: opacity 0.36s ease;
        }

        .page-loader {
          position: fixed;
          inset: 0;
          z-index: 90;
          display: grid;
          place-items: center;
          background: rgba(0, 0, 0, 0.62);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .page-loader-card {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          border-radius: 999px;
          padding: 14px 18px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 18px 55px rgba(0, 0, 0, 0.45);
        }

        .loader-icon {
          color: rgba(255, 255, 255, 0.8);
        }

        .page-loader-text {
          font-size: 14px;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.92);
        }

        .page-loader-dots {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .page-loader-dots span {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: #fff;
          opacity: 0.26;
          animation: loaderPulse 0.9s ease-in-out infinite;
        }

        .page-loader-dots span:nth-child(2) {
          animation-delay: 0.12s;
        }

        .page-loader-dots span:nth-child(3) {
          animation-delay: 0.24s;
        }

        .aurora-layer,
        .beams-layer,
        .depth-layer,
        .grid-layer,
        .network-layer,
        .sword-layer {
          transform-origin: center;
          transition: transform 70ms linear;
          will-change: transform;
        }

        .aurora-layer {
          transform: translate3d(calc(var(--mx) * 18px), calc(var(--my) * 14px), 0) scale(1.08);
        }

        .beams-layer {
          transform: translate3d(calc(var(--mx) * 24px), calc(var(--my) * 16px), 0) scale(1.03);
        }

        .depth-layer {
          transform: translate3d(calc(var(--mx) * 30px), calc(var(--my) * 22px), 0) scale(1.05);
        }

        .grid-layer {
          transform: translate3d(calc(var(--mx) * 34px), calc(var(--my) * 24px), 0) scale(1.05);
        }

        .network-layer {
          transform: translate3d(calc(var(--mx) * 44px), calc(var(--my) * 30px), 0) scale(1.06);
        }

        .sword-layer {
          transform: translate3d(calc(var(--mx) * 36px), calc(var(--my) * 24px), 0)
            rotate(calc(var(--mx) * 5deg));
        }

        .bg-aurora,
        .bg-beams,
        .bg-depth,
        .bg-spotlight,
        .bg-grid,
        .bg-network,
        .bg-sword-wrap,
        .bg-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .bg-aurora {
          background:
            radial-gradient(circle at 50% 14%, rgba(255, 255, 255, 0.05), transparent 24%),
            radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.025), transparent 20%),
            radial-gradient(circle at 80% 24%, rgba(255, 255, 255, 0.02), transparent 18%);
          background-repeat: no-repeat;
          animation: auroraDrift 12s ease-in-out infinite alternate;
        }

        .bg-beams {
          opacity: 0.35;
          background:
            linear-gradient(115deg, transparent 43%, rgba(255, 255, 255, 0.03) 49%, transparent 56%),
            linear-gradient(67deg, transparent 42%, rgba(255, 255, 255, 0.02) 49%, transparent 56%);
          background-size: 480px 480px, 420px 420px;
          animation: networkDrift 24s linear infinite;
        }

        .bg-depth {
          background:
            radial-gradient(circle at 50% 14%, rgba(255, 255, 255, 0.06), transparent 20%),
            radial-gradient(circle at 18% 38%, rgba(129, 140, 248, 0.08), transparent 22%),
            radial-gradient(circle at 82% 32%, rgba(244, 114, 182, 0.06), transparent 20%);
          opacity: 0.9;
        }

        .bg-spotlight {
          opacity: 0.9;
          background:
            radial-gradient(420px circle at var(--cx) var(--cy), rgba(255, 255, 255, 0.08), transparent 58%),
            radial-gradient(170px circle at var(--cx) var(--cy), rgba(255, 255, 255, 0.06), transparent 62%);
          mix-blend-mode: screen;
          transition: opacity 0.2s ease;
        }

        .bg-grid {
          background-image: radial-gradient(circle, rgba(255, 255, 255, 0.14) 1px, transparent 1.2px);
          background-size: 24px 24px;
          background-position: calc(50% + var(--mx) * 8px) calc(50% + var(--my) * 8px);
          opacity: 0.18;
        }

        .bg-network {
          background-image:
            linear-gradient(120deg, transparent 47%, rgba(255, 255, 255, 0.02) 48%, transparent 49%),
            linear-gradient(58deg, transparent 47%, rgba(255, 255, 255, 0.015) 48%, transparent 49%);
          background-size: 420px 420px, 380px 380px;
          background-repeat: repeat;
          opacity: 0.08;
          animation: networkDrift 18s linear infinite;
        }

        .bg-sword-wrap {
          display: grid;
          place-items: center;
        }

        .sword-stage {
          width: 100%;
          height: 100%;
          transform-origin: center;
        }

        .sword-aura,
        .sword-ring,
        .sword-glow,
        .sword {
          position: absolute;
          left: 50%;
          top: 52%;
          transform: translate(-50%, -50%);
        }

        .sword-aura {
          width: 120px;
          height: 860px;
          border-radius: 999px;
          filter: blur(42px);
          opacity: 0.26;
          mix-blend-mode: screen;
        }

        .aura-1 {
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.06),
            rgba(129, 140, 248, 0.18),
            rgba(255, 255, 255, 0.03)
          );
          animation: animeAuraOne 3.8s ease-in-out infinite;
        }

        .aura-2 {
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.04),
            rgba(244, 114, 182, 0.12),
            rgba(255, 255, 255, 0.02)
          );
          animation: animeAuraTwo 4.6s ease-in-out infinite;
        }

        .sword-ring {
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          opacity: 0.22;
        }

        .ring-1 {
          width: 240px;
          height: 900px;
          animation: animeRingOne 3.6s ease-in-out infinite;
        }

        .ring-2 {
          width: 180px;
          height: 780px;
          animation: animeRingTwo 3.2s ease-in-out infinite;
        }

        .sword-glow {
          width: 56px;
          height: 820px;
          border-radius: 999px;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.05),
            rgba(255, 255, 255, 0.24),
            rgba(255, 255, 255, 0.05)
          );
          filter: blur(58px);
          opacity: 0.82;
          animation: swordGlowPulse 2.8s ease-in-out infinite;
        }

        .sword {
          width: 240px;
          height: 860px;
          opacity: 0.36;
          animation: animeSwordFloat 4.8s cubic-bezier(0.45, 0.04, 0.2, 0.98) infinite;
        }

        .blade,
        .blade-shine,
        .edge,
        .guard,
        .grip,
        .pommel {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: block;
        }

        .blade {
          top: 0;
          width: 28px;
          height: 560px;
          border-radius: 18px 18px 8px 8px;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.95),
            rgba(205, 205, 205, 0.46) 56%,
            rgba(20, 20, 20, 0.72)
          );
          box-shadow: 0 0 34px rgba(255, 255, 255, 0.16);
        }

        .blade-shine {
          top: 28px;
          width: 7px;
          height: 500px;
          border-radius: 999px;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0),
            rgba(255, 255, 255, 0.92),
            rgba(255, 255, 255, 0)
          );
          filter: blur(0.6px);
          animation: bladeFlash 2.4s ease-in-out infinite;
        }

        .edge {
          top: 12px;
          width: 6px;
          height: 520px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.92);
        }

        .guard {
          top: 554px;
          width: 150px;
          height: 14px;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            rgba(20, 20, 20, 0.8),
            rgba(255, 255, 255, 0.6),
            rgba(20, 20, 20, 0.8)
          );
        }

        .grip {
          top: 578px;
          width: 18px;
          height: 180px;
          border-radius: 999px;
          background: linear-gradient(
            180deg,
            rgba(20, 20, 20, 0.95),
            rgba(70, 70, 70, 0.8),
            rgba(10, 10, 10, 0.95)
          );
        }

        .pommel {
          top: 776px;
          width: 34px;
          height: 34px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.45), rgba(18, 18, 18, 0.95));
        }

        .bg-particles {
          overflow: hidden;
          contain: layout paint;
        }

        .dynamic-particle {
          position: absolute;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.96);
          box-shadow:
            0 0 10px rgba(255, 255, 255, 0.28),
            0 0 22px rgba(255, 255, 255, 0.08);
          filter: blur(var(--blur));
          mix-blend-mode: screen;
          animation-name: twinklePulse;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          will-change: transform, opacity;
          transform: translate3d(0, 0, 0);
        }

        .top-stack {
          position: fixed;
          top: 10px;
          left: 0;
          width: 100%;
          z-index: 30;
          display: flex;
          justify-content: center;
          pointer-events: none;
          padding-top: env(safe-area-inset-top, 0px);
        }

        .top-center {
          pointer-events: auto;
          width: min(1120px, calc(100% - 18px));
          margin: 0 auto;
          display: grid;
          justify-items: center;
          gap: 10px;
        }

        .nav-shell,
        .panel {
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 18px 55px rgba(0, 0, 0, 0.55);
        }

        .nav-shell {
          display: flex;
          gap: 8px;
          padding: 7px;
          border-radius: 999px;
          margin: 0 auto;
          flex-wrap: wrap;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .tab-btn {
          border: 0;
          font: inherit;
          border-radius: 999px;
          padding: 10px 16px;
          background: transparent;
          color: rgba(255, 255, 255, 0.68);
          font-weight: 760;
          white-space: nowrap;
          position: relative;
          z-index: 1;
          transform: translateZ(0);
          transition: transform 0.18s ease, background 0.18s ease, color 0.18s ease;
        }

        .tab-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          transform: translateY(-1px);
        }

        .tab-btn.is-active {
          background: #fff;
          color: #000;
        }

        .tab-btn.is-active:hover {
          background: #fff;
          color: #000;
          transform: none;
        }

        .top-profile {
          display: grid;
          justify-items: center;
          gap: 8px;
          max-width: 100%;
        }

        .avatar {
          width: 56px;
          height: 56px;
          border-radius: 999px;
          object-fit: cover;
          border: 2px solid rgba(255, 255, 255, 0.14);
          box-shadow:
            0 10px 28px rgba(0, 0, 0, 0.45),
            0 0 0 1px rgba(255, 255, 255, 0.05);
          background: #111;
          animation: floatAvatar 5.6s ease-in-out infinite;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 760;
          transition: border-color 0.22s ease, background 0.22s ease, color 0.22s ease;
        }

        .badge-online {
          border: 1px solid rgba(74, 222, 128, 0.2);
          background: rgba(74, 222, 128, 0.08);
          color: #4ade80;
        }

        .badge-idle {
          border: 1px solid rgba(250, 204, 21, 0.2);
          background: rgba(250, 204, 21, 0.08);
          color: #facc15;
        }

        .badge-dnd {
          border: 1px solid rgba(248, 113, 113, 0.2);
          background: rgba(248, 113, 113, 0.08);
          color: #f87171;
        }

        .badge-offline {
          border: 1px solid rgba(161, 161, 170, 0.18);
          background: rgba(161, 161, 170, 0.08);
          color: #d4d4d8;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
        }

        .badge-online .dot {
          background: #4ade80;
          box-shadow: 0 0 12px rgba(74, 222, 128, 0.45);
        }

        .badge-idle .dot {
          background: #facc15;
          box-shadow: 0 0 12px rgba(250, 204, 21, 0.45);
        }

        .badge-dnd .dot {
          background: #f87171;
          box-shadow: 0 0 12px rgba(248, 113, 113, 0.45);
        }

        .badge-offline .dot {
          background: #a1a1aa;
        }

        .wrap {
          position: relative;
          z-index: 2;
          width: min(1120px, calc(100% - 24px));
          margin: 0 auto;
          min-height: 100vh;
          padding: 208px 0 120px;
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }

        .hero {
          width: 100%;
          max-width: 960px;
          text-align: center;
        }

        .intro {
          margin: 0;
          font-size: 14px;
          font-weight: 660;
          color: rgba(255, 255, 255, 0.82);
        }

        .hero-title {
          margin: 18px 0 0;
          font-size: clamp(40px, 6.8vw, 88px);
          line-height: 0.96;
          font-weight: 950;
          letter-spacing: -0.055em;
          text-shadow: 0 10px 35px rgba(255, 255, 255, 0.05);
        }

        .hero-accent {
          display: block;
          margin-top: 10px;
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.6));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          font-family: Georgia, "Times New Roman", serif;
          font-style: italic;
          font-weight: 500;
          letter-spacing: -0.02em;
        }

        .hero-copy {
          margin: 16px auto 0;
          max-width: 680px;
          font-size: 15px;
          line-height: 1.75;
          color: rgba(255, 255, 255, 0.56);
        }

        .status-row,
        .stat-row,
        .cred-row,
        .cta-row,
        .skills,
        .toolbar-row,
        .panel-head,
        .contact-actions,
        .tier-head,
        .tier-title-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .status-row {
          margin-top: 16px;
        }

        .discord-callout {
          margin-top: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
          padding: 12px 16px;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.06em;
          box-shadow: 0 12px 34px rgba(0, 0, 0, 0.22);
        }

        .stat-row {
          margin-top: 16px;
        }

        .cred-row {
          margin-top: 14px;
        }

        .cta-row {
          margin-top: 20px;
        }

        .skills {
          margin-top: 18px;
        }

        .status-pill,
        .stat-pill,
        .cred-pill,
        .skill-pill {
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          padding: 10px 14px;
          transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease;
        }

        .status-pill,
        .cred-pill {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.74);
        }

        .stat-big {
          padding: 12px 16px;
        }

        .stat-pill strong {
          display: block;
          font-size: 15px;
          line-height: 1;
          font-weight: 900;
        }

        .stat-pill span {
          display: block;
          margin-top: 6px;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: rgba(255, 255, 255, 0.45);
        }

        .music-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font: inherit;
          color: #fff;
        }

        .music-pill.music-on {
          border-color: rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.08);
        }

        .music-pill.music-off {
          opacity: 0.7;
        }

        .skill-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          font-weight: 820;
          color: #f5f5f5;
          border-color: rgba(255, 255, 255, 0.08);
        }

        .skill-pill.tone-lua {
          background: rgba(59, 130, 246, 0.14);
          border-color: rgba(59, 130, 246, 0.28);
        }

        .skill-pill.tone-js {
          background: rgba(234, 179, 8, 0.14);
          border-color: rgba(234, 179, 8, 0.28);
        }

        .skill-pill.tone-cpp {
          background: rgba(147, 51, 234, 0.14);
          border-color: rgba(147, 51, 234, 0.28);
        }

        .skill-pill.tone-cs {
          background: rgba(16, 185, 129, 0.14);
          border-color: rgba(16, 185, 129, 0.28);
        }

        .skill-pill.tone-py {
          background: rgba(249, 115, 22, 0.14);
          border-color: rgba(249, 115, 22, 0.28);
        }

        .skill-mark {
          width: 22px;
          height: 22px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 0.04em;
          color: #fff;
          flex-shrink: 0;
        }

        .skill-mark.lua {
          background: linear-gradient(135deg, #2563eb, #60a5fa);
        }

        .skill-mark.js {
          background: linear-gradient(135deg, #ca8a04, #fde047);
          color: #111;
        }

        .skill-mark.cpp {
          background: linear-gradient(135deg, #7c3aed, #c084fc);
        }

        .skill-mark.cs {
          background: linear-gradient(135deg, #059669, #34d399);
        }

        .skill-mark.py {
          background: linear-gradient(135deg, #ea580c, #fb923c);
        }

        .main-btn,
        .ghost-btn,
        .commission-cta,
        .commission-ghost,
        .discord-callout-btn,
        .video-open-btn {
          border-radius: 999px;
          padding: 12px 16px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          font-weight: 860;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          text-decoration: none;
          font: inherit;
          position: relative;
          overflow: hidden;
          transition:
            transform 0.22s ease,
            background 0.22s ease,
            color 0.22s ease,
            border-color 0.22s ease,
            box-shadow 0.22s ease;
        }

        .main-btn::before,
        .ghost-btn::before,
        .commission-cta::before,
        .commission-ghost::before,
        .discord-callout-btn::before,
        .video-open-btn::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent 20%, rgba(255, 255, 255, 0.18) 50%, transparent 80%);
          transform: translateX(-120%);
          transition: transform 0.55s ease;
          pointer-events: none;
        }

        .main-btn:hover::before,
        .ghost-btn:hover::before,
        .commission-cta:hover::before,
        .commission-ghost:hover::before,
        .discord-callout-btn:hover::before,
        .video-open-btn:hover::before {
          transform: translateX(120%);
        }

        .main-btn,
        .commission-cta,
        .discord-callout-btn,
        .video-open-btn {
          background: #fff;
          color: #000;
          border-color: transparent;
        }

        .main-btn:hover,
        .ghost-btn:hover,
        .commission-cta:hover,
        .commission-ghost:hover,
        .discord-callout-btn:hover,
        .video-open-btn:hover,
        .status-pill:hover,
        .stat-pill:hover,
        .cred-pill:hover,
        .skill-pill:hover {
          transform: translateY(-2px);
        }

        .main-btn:hover,
        .commission-cta:hover,
        .discord-callout-btn:hover,
        .video-open-btn:hover {
          box-shadow: 0 14px 34px rgba(255, 255, 255, 0.12);
        }

        .overlay {
          position: fixed;
          inset: 0;
          z-index: 40;
          display: grid;
          place-items: center;
          padding: 24px;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .overlay-open {
          animation: overlayIn 0.24s ease both;
        }

        .overlay-closing {
          animation: overlayOut 0.2s ease both;
        }

        .panel {
          position: relative;
          width: min(1120px, 100%);
          max-height: min(88dvh, 920px);
          overflow: auto;
          border-radius: 30px;
          padding: 24px;
          will-change: transform, opacity;
          box-shadow:
            0 26px 80px rgba(0, 0, 0, 0.58),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
        }

        .panel-showcase {
          background: rgba(7, 7, 7, 0.96);
        }

        .panel-commission {
          background: rgba(8, 8, 8, 0.96);
        }

        .panel-sheen {
          position: absolute;
          inset: 0;
          pointer-events: none;
          border-radius: inherit;
          background:
            radial-gradient(circle at 20% 0%, rgba(255, 255, 255, 0.045), transparent 24%),
            radial-gradient(circle at 100% 20%, rgba(255, 255, 255, 0.03), transparent 26%);
        }

        .panel-opening {
          animation: panelIn 0.34s cubic-bezier(0.18, 0.86, 0.24, 1) both;
        }

        .panel-closing {
          animation: panelOut 0.22s ease both;
        }

        .panel-head {
          position: relative;
          z-index: 1;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .panel-head h2 {
          margin: 0;
          font-size: clamp(28px, 5vw, 48px);
          line-height: 1;
          font-weight: 920;
          letter-spacing: -0.04em;
        }

        .eyebrow {
          margin: 0 0 8px;
          font-size: 12px;
          font-weight: 850;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.42);
        }

        .close-btn {
          border: 0;
          font: inherit;
          width: 38px;
          height: 38px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.82);
          transition: transform 0.22s ease, background 0.22s ease;
          flex-shrink: 0;
        }

        .close-btn:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.1);
        }

        .toolbar-row {
          position: relative;
          z-index: 1;
          margin-bottom: 18px;
          justify-content: flex-start;
        }

        .toolbar-meta {
          border-radius: 999px;
          padding: 10px 14px;
          font-size: 12px;
          font-weight: 820;
          color: rgba(255, 255, 255, 0.72);
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
          white-space: nowrap;
        }

        .search-shell {
          min-width: min(340px, 100%);
          width: 100%;
          max-width: 460px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 14px;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.04);
          transition: border-color 0.22s ease, background 0.22s ease;
        }

        .search-shell:focus-within {
          border-color: rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.06);
        }

        .search-input {
          width: 100%;
          height: 48px;
          border: 0;
          outline: 0;
          background: transparent;
          color: #fff;
          font: inherit;
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.38);
        }

        .search-icon {
          color: rgba(255, 255, 255, 0.4);
          flex-shrink: 0;
        }

        .video-grid {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .video-card,
        .tier-card,
        .info-card,
        .policy-card,
        .empty-card,
        .big-showcase-card {
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          padding: 16px;
          position: relative;
          overflow: hidden;
          transition:
            transform 0.22s ease,
            border-color 0.22s ease,
            background 0.22s ease,
            box-shadow 0.22s ease;
        }

        .video-card::before,
        .tier-card::before,
        .info-card::before,
        .policy-card::before,
        .big-showcase-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(140deg, rgba(255, 255, 255, 0.025), transparent 38%, transparent 62%, rgba(255, 255, 255, 0.015));
          pointer-events: none;
        }

        .video-card:hover,
        .tier-card:hover,
        .info-card:hover,
        .policy-card:hover,
        .big-showcase-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.22);
        }

        .video-frame-shell {
          position: relative;
          overflow: hidden;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: #050505;
        }

        .big-shell {
          min-height: 100%;
        }

        .video-skeleton {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background:
            linear-gradient(90deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.03));
          background-size: 220% 100%;
          animation: shimmer 1.1s linear infinite;
          z-index: 1;
          transition: opacity 0.25s ease;
        }

        .video-skeleton span {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.9);
          opacity: 0.32;
          animation: loaderPulse 0.85s ease-in-out infinite;
        }

        .video-skeleton span:nth-child(2) {
          animation-delay: 0.12s;
        }

        .video-skeleton span:nth-child(3) {
          animation-delay: 0.24s;
        }

        .video-frame-shell.is-loaded .video-skeleton {
          opacity: 0;
          pointer-events: none;
        }

        .video-frame {
          display: block;
          width: 100%;
          aspect-ratio: 16 / 9;
          height: auto;
          border: 0;
          background: #050505;
          opacity: 0;
          transform: scale(1.01);
          transition: opacity 0.35s ease, transform 0.35s ease;
          position: relative;
          z-index: 2;
        }

        .video-frame-shell.is-loaded .video-frame {
          opacity: 1;
          transform: scale(1);
        }

        .video-card h3,
        .tier-card h3,
        .info-card h3,
        .policy-card h4,
        .empty-card h3,
        .big-showcase-card h4 {
          margin: 14px 0 0;
          font-size: 18px;
          font-weight: 900;
          position: relative;
          z-index: 1;
        }

        .video-card p,
        .tier-card p,
        .info-card li,
        .policy-card p,
        .empty-card p,
        .big-showcase-card p {
          margin: 8px 0 0;
          line-height: 1.65;
          color: rgba(255, 255, 255, 0.58);
          position: relative;
          z-index: 1;
        }

        .video-actions {
          margin-top: 12px;
          display: flex;
          justify-content: flex-start;
          flex-wrap: wrap;
          gap: 10px;
          position: relative;
          z-index: 1;
        }

        .empty-card {
          grid-column: 1 / -1;
          text-align: center;
          padding: 28px 18px;
        }

        .big-showcase-section {
          position: relative;
          z-index: 1;
          margin-top: 22px;
        }

        .section-heading {
          margin-bottom: 14px;
        }

        .section-heading h3 {
          margin: 0;
          font-size: clamp(22px, 4vw, 34px);
          font-weight: 900;
          letter-spacing: -0.03em;
        }

        .big-showcase-list {
          display: grid;
          gap: 14px;
        }

        .big-showcase-card {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
          gap: 16px;
          align-items: stretch;
        }

        .big-showcase-copy {
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          z-index: 1;
        }

        .big-bio {
          color: rgba(255, 255, 255, 0.72) !important;
        }

        .pricing-list {
          position: relative;
          z-index: 1;
          display: grid;
          gap: 14px;
        }

        .tier-head {
          justify-content: space-between;
        }

        .tier-title-wrap {
          gap: 12px;
        }

        .tier-icon {
          width: 34px;
          height: 34px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.85);
          flex-shrink: 0;
        }

        .tier-price {
          color: rgba(255, 255, 255, 0.86);
          font-weight: 850;
          font-size: 14px;
          position: relative;
          z-index: 1;
        }

        .tier-meta {
          margin-top: 8px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.45);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          position: relative;
          z-index: 1;
        }

        .commission-grid,
        .policy-grid {
          position: relative;
          z-index: 1;
          display: grid;
          gap: 14px;
          margin-top: 16px;
        }

        .commission-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .policy-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .info-card ul {
          margin: 12px 0 0;
          padding-left: 18px;
          display: grid;
          gap: 10px;
        }

        .policy-card {
          text-align: center;
        }

        .policy-icon {
          width: 28px;
          height: 28px;
          margin: 0 auto 12px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.08);
          position: relative;
          z-index: 1;
        }

        .contact-actions {
          position: relative;
          z-index: 1;
          margin-top: 18px;
        }

        .mini {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }

        .reveal {
          animation: rise 0.55s ease both;
        }

        .delay-1 {
          animation-delay: 0.08s;
        }

        .delay-2 {
          animation-delay: 0.13s;
        }

        .delay-3 {
          animation-delay: 0.18s;
        }

        @keyframes rise {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes overlayIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes overlayOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes panelIn {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.972);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes panelOut {
          from {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateY(10px) scale(0.988);
          }
        }

        @keyframes loaderPulse {
          0%,
          100% {
            opacity: 0.26;
            transform: translateY(0) scale(0.8);
          }
          50% {
            opacity: 1;
            transform: translateY(-3px) scale(1.08);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }

        @keyframes auroraDrift {
          0% {
            background-position:
              50% 14%,
              20% 30%,
              80% 24%;
          }
          100% {
            background-position:
              53% 18%,
              16% 36%,
              84% 20%;
          }
        }

        @keyframes networkDrift {
          0% {
            background-position:
              0 0,
              0 0;
          }
          100% {
            background-position:
              -56px 34px,
              34px -22px;
          }
        }

        @keyframes animeSwordFloat {
          0%,
          100% {
            transform: translate(-50%, -50%) rotate(-10deg) scale(1);
          }
          20% {
            transform: translate(-49.3%, -53.4%) rotate(-5.5deg) scale(1.01);
          }
          50% {
            transform: translate(-50.7%, -54.2%) rotate(-7.2deg) scale(1.015);
          }
          78% {
            transform: translate(-49.4%, -51.8%) rotate(-4.2deg) scale(1.008);
          }
        }

        @keyframes swordGlowPulse {
          0%,
          100% {
            transform: translate(-50%, -50%) scaleY(1) scaleX(1);
            opacity: 0.72;
          }
          50% {
            transform: translate(-50%, -50%) scaleY(1.08) scaleX(1.14);
            opacity: 0.9;
          }
        }

        @keyframes animeAuraOne {
          0%,
          100% {
            transform: translate(-50%, -50%) rotate(-12deg) scale(0.9);
            opacity: 0.18;
          }
          50% {
            transform: translate(-50%, -50%) rotate(-4deg) scale(1.08);
            opacity: 0.3;
          }
        }

        @keyframes animeAuraTwo {
          0%,
          100% {
            transform: translate(-50%, -50%) rotate(6deg) scale(0.92);
            opacity: 0.14;
          }
          50% {
            transform: translate(-50%, -50%) rotate(-2deg) scale(1.05);
            opacity: 0.24;
          }
        }

        @keyframes animeRingOne {
          0%,
          100% {
            transform: translate(-50%, -50%) rotate(-10deg) scale(0.94);
            opacity: 0.12;
          }
          50% {
            transform: translate(-50%, -50%) rotate(2deg) scale(1.04);
            opacity: 0.24;
          }
        }

        @keyframes animeRingTwo {
          0%,
          100% {
            transform: translate(-50%, -50%) rotate(8deg) scale(0.96);
            opacity: 0.1;
          }
          50% {
            transform: translate(-50%, -50%) rotate(-6deg) scale(1.02);
            opacity: 0.2;
          }
        }

        @keyframes bladeFlash {
          0%,
          100% {
            opacity: 0.24;
            transform: translateX(-50%) translateY(0);
          }
          50% {
            opacity: 0.95;
            transform: translateX(-50%) translateY(-16px);
          }
        }

        @keyframes twinklePulse {
          0%,
          100% {
            opacity: calc(var(--opacity-base) * 0.52);
            box-shadow:
              0 0 8px rgba(255, 255, 255, 0.16),
              0 0 14px rgba(255, 255, 255, 0.04);
          }
          50% {
            opacity: var(--opacity-base);
            box-shadow:
              0 0 14px rgba(255, 255, 255, 0.3),
              0 0 24px rgba(255, 255, 255, 0.1);
          }
        }

        @keyframes floatAvatar {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @media (max-width: 980px) {
          .video-grid,
          .commission-grid,
          .policy-grid,
          .big-showcase-card {
            grid-template-columns: 1fr;
          }

          .big-showcase-card {
            gap: 14px;
          }
        }

        @media (max-width: 760px) {
          .top-stack {
            top: 8px;
          }

          .wrap {
            width: min(100%, calc(100% - 16px));
            padding: 200px 0 100px;
          }

          .hero-title {
            font-size: clamp(34px, 13vw, 58px);
          }

          .hero-copy {
            font-size: 14px;
          }

          .nav-shell {
            gap: 6px;
            padding: 6px;
            border-radius: 22px;
            width: 100%;
          }

          .tab-btn {
            flex: 1 1 auto;
            min-width: 0;
            padding: 10px 12px;
            font-size: 12px;
          }

          .avatar {
            width: 52px;
            height: 52px;
          }

          .overlay {
            display: block;
            padding: 12px 12px calc(18px + env(safe-area-inset-bottom, 0px));
            overflow-y: auto;
            overscroll-behavior-y: contain;
            -webkit-overflow-scrolling: touch;
          }

          .panel {
            width: 100%;
            max-height: none;
            min-height: auto;
            margin: 0 auto;
            border-radius: 24px;
            padding: 18px;
            overflow: visible;
          }

          .panel-head {
            align-items: flex-start;
          }

          .toolbar-row {
            justify-content: stretch;
          }

          .search-shell {
            min-width: 100%;
            max-width: 100%;
          }

          .video-card,
          .tier-card,
          .info-card,
          .policy-card,
          .empty-card,
          .big-showcase-card {
            border-radius: 20px;
            padding: 14px;
          }
        }

        @media (max-width: 520px) {
          .top-center {
            width: min(100%, calc(100% - 12px));
          }

          .wrap {
            padding: 194px 0 90px;
          }

          .intro {
            font-size: 13px;
          }

          .hero-copy {
            max-width: 100%;
          }

          .page-loader-card {
            padding: 12px 14px;
          }

          .page-loader-text {
            font-size: 13px;
          }

          .panel-head h2 {
            font-size: clamp(24px, 9vw, 34px);
          }

          .section-heading h3 {
            font-size: clamp(20px, 8vw, 28px);
          }

          .info-card ul {
            padding-left: 16px;
          }

          .sword-stage {
            transform: scale(0.88);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.12s !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </main>
  );
}
