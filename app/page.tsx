"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
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

type HomeFeature = {
  title: string;
  body: string;
  icon: PriceTier["icon"] | "check";
};

type WorkflowStep = {
  title: string;
  body: string;
};

type ParticleDot = {
  left: string;
  top: string;
  size: number;
  opacity: number;
  delay: string;
  duration: string;
  driftX: number;
  driftY: number;
  blur: number;
};

type CSSVars = CSSProperties & {
  "--blur"?: string;
  "--opacity-base"?: number | string;
  "--drift-x"?: string;
  "--drift-y"?: string;
};

type LanyardEmoji = {
  id?: string | null;
  name?: string | null;
};

type LanyardActivity = {
  type?: number;
  state?: string | null;
  emoji?: LanyardEmoji | null;
};

type LanyardPresence = {
  discord_status?: string;
  activities?: LanyardActivity[];
};

type LanyardHello = {
  heartbeat_interval?: number;
};

type LanyardSocketMessage = {
  op?: number;
  t?: string;
  d?: LanyardHello | LanyardPresence;
};

const DISCORD_USER_ID = "1404955716887904266";
const DISCORD_STATUS_ENABLED = /^\d{8,25}$/.test(DISCORD_USER_ID);
const DISCORD_WS_URL = "wss://api.lanyard.rest/socket";
const DISCORD_REST_URL = `https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`;

const INITIAL_BOOT_MS = 650;
const BG_MUSIC_SRC = "/portfolio-music.mp3";
const BG_MUSIC_VOLUME = 0.14;

const EMAIL_ADDRESS = "liamj7872@gmail.com";
const DISCORD_INVITE = "https://discord.gg/62nWRxRs";
const ROBLOX_PROFILE_URL = "https://www.roblox.com/users/4554029027/profile";

const MUSIC_STORAGE_KEY = "portfolio_music_enabled_v7";
const ASSET_VERSION = "20260302";
const PROFILE_IMAGE_SRC = `/profile.png?v=${ASSET_VERSION}`;
const LOGO_IMAGE_SRC = `/logo.png?v=${ASSET_VERSION}`;

const avatarFallback = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <rect width="120" height="120" rx="60" fill="#0b0b0b"/>
    <circle cx="60" cy="60" r="58" fill="none" stroke="rgba(255,255,255,0.10)" stroke-width="2"/>
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

const avatarSources = [PROFILE_IMAGE_SRC, LOGO_IMAGE_SRC, avatarFallback] as const;

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
    credits: "Credits: SkaterStudios (HELPED) & nvrliam (ME)",
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

const homeFeatures: HomeFeature[] = [
  {
    title: "Stable Systems",
    body: "Built to survive spam input, edge cases, respawns, and real player usage instead of only working in tests.",
    icon: "full",
  },
  {
    title: "Clean Structure",
    body: "Organized logic, readable scripts, and cleaner integration so your project stays easy to expand later.",
    icon: "mini",
  },
  {
    title: "Gameplay Polish",
    body: "Smooth feedback, better presentation, and details that make systems feel premium in-game.",
    icon: "play",
  },
  {
    title: "Long-Term Value",
    body: "I fix root problems instead of stacking messy patches that break later.",
    icon: "check",
  },
];

const workflowSteps: WorkflowStep[] = [
  {
    title: "Plan",
    body: "Clear scope first so features stay focused and do not spiral into a mess.",
  },
  {
    title: "Build",
    body: "Systems stay modular, clean, and easy to maintain.",
  },
  {
    title: "Stress Test",
    body: "Spam, respawn, timing, and failure cases get thought through before delivery.",
  },
];

function createParticleDots(count = 28): ParticleDot[] {
  return Array.from({ length: count }, (_, i) => {
    const leftPct = 2 + ((i * 13) % 96);
    const topPct = 2 + ((i * 19) % 94);
    const size = 2 + (i % 4);
    const opacity = Math.min(0.2 + (i % 6) * 0.08, 0.72);
    const driftX = ((i % 7) - 3) * 1.15;
    const driftY = (((i + 2) % 7) - 3) * 1.05;
    const blur = Math.max(0, (size - 2) * 0.35);

    return {
      left: `${leftPct}%`,
      top: `${topPct}%`,
      size,
      opacity,
      delay: `${(i % 10) * 0.2}s`,
      duration: `${4.8 + (i % 7) * 0.75}s`,
      driftX,
      driftY,
      blur,
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
    img.decoding = "async";
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
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

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function setSafeVolume(audio: HTMLAudioElement, value: number) {
  audio.volume = clamp01(value);
}

function getCustomStatusNote(activities?: LanyardActivity[]) {
  const custom = activities?.find((activity) => activity.type === 4);
  if (!custom) return "";

  const emoji = custom.emoji && !custom.emoji.id ? custom.emoji.name?.trim() ?? "" : "";
  const text = custom.state?.trim() ?? "";
  const combined = [emoji, text].filter(Boolean).join(" ").trim();

  if (!combined) return "";
  return combined.length > 90 ? `${combined.slice(0, 89).trimEnd()}…` : combined;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);

    update();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", update);
      return () => media.removeEventListener("change", update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  return reduced;
}

function usePageVisible() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    update();

    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  return visible;
}

function useInViewOnce<T extends Element>(enabled: boolean) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setInView(true);
      return;
    }

    if (inView) return;

    const node = ref.current;
    if (!node) return;

    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((entry) => entry.isIntersecting || entry.intersectionRatio > 0);
        if (hit) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "220px 0px" },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [enabled, inView]);

  return { ref, inView };
}

function VideoEmbed({
  title,
  src,
  eager,
}: {
  title: string;
  src: string;
  eager: boolean;
}) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>(!eager);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  const shouldMount = eager || inView;

  return (
    <div ref={ref} className={`video-frame-shell ${loaded ? "is-loaded" : ""}`}>
      <div className="video-skeleton" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      {shouldMount ? (
        <iframe
          title={title}
          src={src}
          className="video-frame"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading={eager ? "eager" : "lazy"}
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setLoaded(true)}
        />
      ) : (
        <div className="video-placeholder" aria-hidden="true" />
      )}
    </div>
  );
}

function TierIcon({ icon }: { icon: PriceTier["icon"] }) {
  if (icon === "fix") return <Wrench className="mini" />;
  if (icon === "mini") return <Boxes className="mini" />;
  if (icon === "play") return <Gamepad2 className="mini" />;
  if (icon === "full") return <Cpu className="mini" />;
  return <Rocket className="mini" />;
}

function FeatureIcon({ icon }: { icon: HomeFeature["icon"] }) {
  if (icon === "check") return <Check className="mini" />;
  if (icon === "fix") return <Wrench className="mini" />;
  if (icon === "mini") return <Boxes className="mini" />;
  if (icon === "play") return <Gamepad2 className="mini" />;
  if (icon === "full") return <Cpu className="mini" />;
  return <Rocket className="mini" />;
}

export default function PortfolioPage() {
  const [panel, setPanel] = useState<Panel>("none");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const [emailCopied, setEmailCopied] = useState(false);
  const [discordStatus, setDiscordStatus] = useState<DiscordPresence>(DISCORD_STATUS_ENABLED ? "offline" : "online");
  const [discordNote, setDiscordNote] = useState("");
  const [statusLoaded, setStatusLoaded] = useState(!DISCORD_STATUS_ENABLED);

  const [pageReady, setPageReady] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [musicUnlocked, setMusicUnlocked] = useState(false);
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [liteMode, setLiteMode] = useState(false);

  const shellRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const copyTimerRef = useRef<number | null>(null);
  const fadeFrameRef = useRef<number | null>(null);

  const reduceMotion = usePrefersReducedMotion();
  const pageVisible = usePageVisible();
  const modalOpen = panel !== "none";
  const activeTab: NavTab = panel === "none" ? "home" : panel;

  const particleDots = useMemo(() => createParticleDots(liteMode ? 14 : 28), [liteMode]);
  const eagerShowcaseCount = liteMode ? 1 : 3;

  const preloadTargets = useMemo(() => {
    if (liteMode) return [];

    return Array.from(
      new Set([
        ...showcases.slice(0, 2).map((item) => item.embed),
        ...bigShowcases.slice(0, 1).map((item) => item.embed),
      ]),
    );
  }, [liteMode]);

  const openPanel = useCallback((next: Exclude<Panel, "none">) => {
    setPanel(next);
  }, []);

  const closePanel = useCallback(() => {
    setPanel("none");
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
    const value = deferredQuery.trim().toLowerCase();
    if (!value) return showcases;

    return showcases.filter(
      (item) =>
        item.title.toLowerCase().includes(value) ||
        item.desc.toLowerCase().includes(value),
    );
  }, [deferredQuery]);

  const statusText = useMemo(() => {
    if (!statusLoaded) return "Checking status...";
    if (discordStatus === "online") return "Available now";
    if (discordStatus === "idle") return "Away right now";
    if (discordStatus === "dnd") return "Busy right now";
    return "Offline";
  }, [discordStatus, statusLoaded]);

  useEffect(() => {
    const updateLiteMode = () => {
      const nav = navigator as Navigator & {
        deviceMemory?: number;
        connection?: { saveData?: boolean };
      };

      const isSmallScreen = window.matchMedia("(max-width: 900px)").matches;
      const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
      const lowMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4;
      const lowCores = typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= 4;
      const saveData = Boolean(nav.connection?.saveData);

      setLiteMode(isSmallScreen || isCoarsePointer || lowMemory || lowCores || saveData || reduceMotion);
    };

    updateLiteMode();
    window.addEventListener("resize", updateLiteMode, { passive: true });

    return () => {
      window.removeEventListener("resize", updateLiteMode);
    };
  }, [reduceMotion]);

  useEffect(() => {
    let active = true;

    const boot = async () => {
      await Promise.allSettled([
        waitForPageLoad(),
        waitForFonts(),
        preloadImage(PROFILE_IMAGE_SRC),
        preloadImage(LOGO_IMAGE_SRC),
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
    try {
      const saved = window.localStorage.getItem(MUSIC_STORAGE_KEY);
      if (saved === "0") setMusicEnabled(false);
      if (saved === "1") setMusicEnabled(true);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(MUSIC_STORAGE_KEY, musicEnabled ? "1" : "0");
    } catch {}
  }, [musicEnabled]);

  useEffect(() => {
    const setViewportHeight = () => {
      const height = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty("--app-vh", `${Math.round(height)}px`);
    };

    setViewportHeight();

    window.addEventListener("resize", setViewportHeight, { passive: true });
    window.visualViewport?.addEventListener("resize", setViewportHeight);
    window.visualViewport?.addEventListener("scroll", setViewportHeight);

    return () => {
      window.removeEventListener("resize", setViewportHeight);
      window.visualViewport?.removeEventListener("resize", setViewportHeight);
      window.visualViewport?.removeEventListener("scroll", setViewportHeight);
    };
  }, []);

  useEffect(() => {
    const links: HTMLLinkElement[] = [];
    let prefetchTimer = 0;

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
    addLink({ rel: "dns-prefetch", href: "https://streamable.com" });
    addLink({ rel: "dns-prefetch", href: "https://api.lanyard.rest" });
    addLink({ rel: "preload", href: PROFILE_IMAGE_SRC, as: "image" });
    addLink({ rel: "preload", href: LOGO_IMAGE_SRC, as: "image" });

    if (!liteMode && preloadTargets.length > 0) {
      prefetchTimer = window.setTimeout(() => {
        for (const href of preloadTargets) {
          addLink({ rel: "prefetch", href });
        }
      }, 260);
    }

    return () => {
      window.clearTimeout(prefetchTimer);

      for (const link of links) {
        link.parentNode?.removeChild(link);
      }
    };
  }, [liteMode, preloadTargets]);

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const ease = liteMode ? 1 : reduceMotion ? 0.18 : 0.1;
    const motionScale = liteMode ? 0.14 : reduceMotion ? 0.18 : 1;
    const supportsPointer = "PointerEvent" in window;
    const supportsTouch =
      navigator.maxTouchPoints > 0 ||
      "ontouchstart" in window ||
      window.matchMedia("(pointer: coarse)").matches;

    const passiveOptions: AddEventListenerOptions = { passive: true };

    const updateFromPoint = (clientX: number, clientY: number) => {
      const rect = el.getBoundingClientRect();
      const safeWidth = Math.max(rect.width, 1);
      const safeHeight = Math.max(rect.height, 1);

      const localX = clamp(clientX - rect.left, 0, safeWidth);
      const localY = clamp(clientY - rect.top, 0, safeHeight);

      targetX = (localX / safeWidth - 0.5) * 2;
      targetY = (localY / safeHeight - 0.5) * 2;

      el.style.setProperty("--cx", `${((localX / safeWidth) * 100).toFixed(2)}%`);
      el.style.setProperty("--cy", `${((localY / safeHeight) * 100).toFixed(2)}%`);

      if (liteMode) {
        el.style.setProperty("--mx", (targetX * motionScale).toFixed(4));
        el.style.setProperty("--my", (targetY * motionScale).toFixed(4));
      }
    };

    const resetMotion = () => {
      targetX = 0;
      targetY = 0;
      el.style.setProperty("--cx", "50%");
      el.style.setProperty("--cy", "34%");

      if (liteMode) {
        el.style.setProperty("--mx", "0");
        el.style.setProperty("--my", "0");
      }
    };

    const frame = () => {
      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;

      el.style.setProperty("--mx", (currentX * motionScale).toFixed(4));
      el.style.setProperty("--my", (currentY * motionScale).toFixed(4));

      raf = window.requestAnimationFrame(frame);
    };

    const handlePointerMove = (event: PointerEvent) => {
      updateFromPoint(event.clientX, event.clientY);
    };

    const handleMouseMove = (event: MouseEvent) => {
      updateFromPoint(event.clientX, event.clientY);
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      updateFromPoint(touch.clientX, touch.clientY);
    };

    const handleWindowBlur = () => {
      resetMotion();
    };

    el.style.setProperty("--mx", "0");
    el.style.setProperty("--my", "0");
    el.style.setProperty("--cx", "50%");
    el.style.setProperty("--cy", "34%");

    if (!liteMode && pageVisible) {
      raf = window.requestAnimationFrame(frame);
    }

    if (supportsPointer) {
      window.addEventListener("pointermove", handlePointerMove, passiveOptions);
    } else {
      window.addEventListener("mousemove", handleMouseMove, passiveOptions);
    }

    if (supportsTouch) {
      window.addEventListener("touchmove", handleTouchMove, passiveOptions);
      window.addEventListener("touchend", resetMotion, passiveOptions);
      window.addEventListener("touchcancel", resetMotion, passiveOptions);
    }

    window.addEventListener("blur", handleWindowBlur);

    return () => {
      if (supportsPointer) {
        window.removeEventListener("pointermove", handlePointerMove);
      } else {
        window.removeEventListener("mousemove", handleMouseMove);
      }

      if (supportsTouch) {
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("touchend", resetMotion);
        window.removeEventListener("touchcancel", resetMotion);
      }

      window.removeEventListener("blur", handleWindowBlur);
      window.cancelAnimationFrame(raf);
    };
  }, [liteMode, pageVisible, reduceMotion]);

  useEffect(() => {
    if (!modalOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
    };
  }, [modalOpen]);

  useEffect(() => {
    if (panel !== "showcase") {
      setQuery("");
      return;
    }

    if (liteMode) return;

    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 120);

    return () => {
      window.clearTimeout(timer);
    };
  }, [panel, liteMode]);

  useEffect(() => {
    if (panel === "none") return;

    lastFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const root = panelRef.current;
    const selector =
      'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const focusTimer = window.setTimeout(() => {
      const focusTarget =
        (panel === "showcase" ? searchInputRef.current : null) ??
        root?.querySelector<HTMLElement>(selector);

      focusTarget?.focus();
    }, 40);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePanel();
        return;
      }

      if (
        event.key === "/" &&
        panel === "showcase" &&
        document.activeElement !== searchInputRef.current
      ) {
        const active = document.activeElement as HTMLElement | null;
        const tag = active?.tagName?.toLowerCase();
        const isTypingField =
          tag === "input" || tag === "textarea" || Boolean(active?.isContentEditable);

        if (!isTypingField) {
          event.preventDefault();
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
        }
      }

      if (event.key !== "Tab" || !root) return;

      const focusables = Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
        (node) => node.tabIndex !== -1 && node.getClientRects().length > 0,
      );

      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const current = document.activeElement as HTMLElement | null;

      if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKeyDown);

      if (lastFocusedRef.current && document.contains(lastFocusedRef.current)) {
        lastFocusedRef.current.focus();
      }
    };
  }, [panel, closePanel]);

  useEffect(() => {
    if (!DISCORD_STATUS_ENABLED) return;

    let cancelled = false;
    let socket: WebSocket | null = null;
    let heartbeatTimer = 0;
    let reconnectTimer = 0;
    let resyncTimer = 0;
    let reconnectAttempt = 0;
    let fetchController: AbortController | null = null;
    let fetchTimeout = 0;
    let lastSocketUpdateAt = 0;

    const applyPresence = (payload: LanyardPresence | undefined, source: "socket" | "rest") => {
      const raw = String(payload?.discord_status ?? "offline").toLowerCase();

      const nextStatus: DiscordPresence =
        raw === "online" || raw === "idle" || raw === "dnd" ? raw : "offline";

      const now = Date.now();

      if (
        source === "rest" &&
        socket?.readyState === WebSocket.OPEN &&
        lastSocketUpdateAt > 0 &&
        now - lastSocketUpdateAt < 20000
      ) {
        return;
      }

      if (source === "socket") {
        lastSocketUpdateAt = now;
      }

      setDiscordStatus(nextStatus);
      setDiscordNote(getCustomStatusNote(payload?.activities));
      setStatusLoaded(true);
    };

    const clearHeartbeat = () => {
      if (heartbeatTimer) {
        window.clearInterval(heartbeatTimer);
        heartbeatTimer = 0;
      }
    };

    const clearReconnect = () => {
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
        reconnectTimer = 0;
      }
    };

    const clearFetchTimeout = () => {
      if (fetchTimeout) {
        window.clearTimeout(fetchTimeout);
        fetchTimeout = 0;
      }
    };

    const closeSocket = () => {
      clearHeartbeat();

      if (!socket) return;

      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;

      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }

      socket = null;
    };

    const fetchPresence = async () => {
      fetchController?.abort();
      clearFetchTimeout();

      const controller = new AbortController();
      fetchController = controller;

      fetchTimeout = window.setTimeout(() => {
        controller.abort();
      }, 5000);

      try {
        const response = await fetch(DISCORD_REST_URL, {
          cache: "no-store",
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch Discord presence");
        }

        const data = (await response.json()) as { data?: LanyardPresence };

        if (cancelled || controller.signal.aborted) return;

        applyPresence(data.data, "rest");
      } catch {
        if (cancelled || controller.signal.aborted) return;
        setStatusLoaded(true);
      } finally {
        clearFetchTimeout();

        if (fetchController === controller) {
          fetchController = null;
        }
      }
    };

    const sendHeartbeat = () => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ op: 3 }));
      }
    };

    const scheduleReconnect = () => {
      if (cancelled) return;

      clearReconnect();

      const delay = Math.min(30000, 1500 * 2 ** Math.min(reconnectAttempt, 4));
      reconnectAttempt += 1;

      reconnectTimer = window.setTimeout(() => {
        void fetchPresence();
        connectSocket();
      }, delay);
    };

    const connectSocket = () => {
      if (cancelled || !("WebSocket" in window)) return;

      closeSocket();

      try {
        socket = new WebSocket(DISCORD_WS_URL);
      } catch {
        scheduleReconnect();
        return;
      }

      socket.onopen = () => {
        reconnectAttempt = 0;
      };

      socket.onmessage = (event) => {
        if (typeof event.data !== "string") return;

        let message: LanyardSocketMessage | null = null;

        try {
          message = JSON.parse(event.data) as LanyardSocketMessage;
        } catch {
          return;
        }

        if (!message) return;

        if (message.op === 1) {
          const hello = message.d as LanyardHello | undefined;
          const heartbeatInterval =
            typeof hello?.heartbeat_interval === "number"
              ? Math.max(1000, hello.heartbeat_interval)
              : 30000;

          if (socket?.readyState === WebSocket.OPEN) {
            socket.send(
              JSON.stringify({
                op: 2,
                d: { subscribe_to_id: DISCORD_USER_ID },
              }),
            );
            sendHeartbeat();
          }

          clearHeartbeat();
          heartbeatTimer = window.setInterval(sendHeartbeat, heartbeatInterval);
          return;
        }

        if (message.op === 0 && (message.t === "INIT_STATE" || message.t === "PRESENCE_UPDATE")) {
          applyPresence(message.d as LanyardPresence, "socket");
        }
      };

      socket.onerror = () => {
        socket?.close();
      };

      socket.onclose = () => {
        if (cancelled) return;
        clearHeartbeat();
        scheduleReconnect();
      };
    };

    void fetchPresence();
    connectSocket();

    resyncTimer = window.setInterval(() => {
      if (!document.hidden) {
        void fetchPresence();
      }
    }, 45000);

    const onVisibility = () => {
      if (!document.hidden) {
        void fetchPresence();

        if (!socket || socket.readyState >= WebSocket.CLOSING) {
          connectSocket();
        }
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);

      if (resyncTimer) {
        window.clearInterval(resyncTimer);
      }

      clearReconnect();
      clearFetchTimeout();
      fetchController?.abort();
      closeSocket();
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = true;
    audio.preload = "metadata";
    setSafeVolume(audio, 0);
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

      const safeFrom = clamp01(from);
      const safeTo = clamp01(to);
      const safeDuration = Math.max(1, duration);
      const start = performance.now();

      const tick = (now: number) => {
        if (disposed) return;

        const progress = Math.min(1, (now - start) / safeDuration);
        const eased = 1 - Math.pow(1 - progress, 3);
        const nextVolume = safeFrom + (safeTo - safeFrom) * eased;

        setSafeVolume(audio, nextVolume);

        if (progress < 1) {
          fadeFrameRef.current = window.requestAnimationFrame(tick);
        } else {
          setSafeVolume(audio, safeTo);
          fadeFrameRef.current = null;
        }
      };

      fadeFrameRef.current = window.requestAnimationFrame(tick);
    };

    const targetVolume = clamp01(liteMode ? Math.min(BG_MUSIC_VOLUME, 0.08) : BG_MUSIC_VOLUME);

    const startMusic = () => {
      if (!musicEnabled || disposed || !pageVisible) return;

      clearPauseTimer();

      if (!audio.paused) {
        setMusicUnlocked(true);
        fadeVolume(clamp01(audio.volume), targetVolume, 160);
        return;
      }

      audio.muted = false;

      if (audio.volume <= 0) {
        setSafeVolume(audio, 0.001);
      }

      const result = audio.play();

      if (result && typeof result.then === "function") {
        result
          .then(() => {
            if (disposed) return;
            setMusicUnlocked(true);
            fadeVolume(clamp01(audio.volume), targetVolume, 300);
          })
          .catch(() => {
            if (disposed) return;
            setMusicUnlocked(false);
          });
      } else {
        setMusicUnlocked(true);
        fadeVolume(clamp01(audio.volume), targetVolume, 300);
      }
    };

    const stopMusic = () => {
      clearPauseTimer();

      if (audio.paused && audio.volume <= 0.001) return;

      fadeVolume(clamp01(audio.volume), 0, 220);

      pauseTimer = window.setTimeout(() => {
        if (disposed) return;
        audio.pause();
      }, 240);
    };

    if (musicEnabled && pageVisible) {
      startMusic();
    } else {
      stopMusic();
    }

    const unlock = () => {
      if (!musicEnabled || !pageVisible) return;
      startMusic();
    };

    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock);

    return () => {
      disposed = true;
      clearPauseTimer();
      cancelFade();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [musicEnabled, pageVisible, liteMode]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }

      if (fadeFrameRef.current !== null) {
        window.cancelAnimationFrame(fadeFrameRef.current);
      }
    };
  }, []);

  return (
    <main
      className={`page-shell ${pageReady ? "ready" : "booting"} ${liteMode ? "lite-mode" : ""}`}
      ref={shellRef}
    >
      <audio ref={audioRef} src={BG_MUSIC_SRC} aria-hidden="true" playsInline preload="metadata" />

      <div className="bg-aurora aurora-layer" />
      <div className="bg-beams beams-layer" />
      <div className="bg-grid grid-layer" />
      <div className="bg-spotlight spotlight-layer" />

      <div className="bg-particles" aria-hidden="true">
        {particleDots.map((dot, index) => (
          <span
            key={`${dot.left}-${dot.top}-${index}`}
            className="dynamic-particle"
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
                "--drift-x": `${dot.driftX}px`,
                "--drift-y": `${dot.driftY}px`,
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
              onClick={closePanel}
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

            <div className="presence-stack">
              <div
                className={`badge badge-${discordStatus}`}
                aria-live="polite"
                aria-busy={!statusLoaded}
              >
                <span className="dot" />
                {statusText}
              </div>

              {discordNote && (
                <div className="note-badge" title={discordNote}>
                  {discordNote}
                </div>
              )}
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
            Smooth presentation, stable logic, and code that does not fall apart later.
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
            <a href={DISCORD_INVITE} target="_blank" rel="noreferrer noopener" className="discord-callout-btn">
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

            <a
              href={ROBLOX_PROFILE_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="ghost-btn"
            >
              Roblox Profile
            </a>
          </div>

          <div className="skills reveal delay-3">
            {skills.map((skill) => (
              <span key={skill.label} className={`skill-pill tone-${skill.tone}`}>
                <span className={`skill-mark ${skill.tone}`}>{skill.mark}</span>
                {skill.label}
              </span>
            ))}
          </div>

          <div className="feature-grid reveal delay-3">
            {homeFeatures.map((item) => (
              <article key={item.title} className="feature-card">
                <div className="feature-icon">
                  <FeatureIcon icon={item.icon} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>

          <div className="workflow-grid reveal delay-3">
            {workflowSteps.map((step, index) => (
              <article key={step.title} className="workflow-card">
                <span className="workflow-num">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      {panel !== "none" && (
        <div className="overlay" onClick={closePanel}>
          <section
            ref={panelRef}
            className={`panel ${panel === "showcase" ? "panel-showcase" : "panel-commission"} panel-opening`}
            onClick={(event) => event.stopPropagation()}
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
                  <button type="button" className="close-btn" onClick={closePanel} aria-label="Close">
                    <X className="mini" />
                  </button>
                </div>

                <div className="toolbar-row">
                  <div className="search-shell">
                    <Search className="mini search-icon" />
                    <input
                      ref={searchInputRef}
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search systems..."
                      className="search-input"
                      aria-label="Search showcase"
                    />
                    {query && (
                      <button
                        type="button"
                        className="search-clear"
                        onClick={() => setQuery("")}
                        aria-label="Clear search"
                      >
                        <X className="mini" />
                      </button>
                    )}
                  </div>

                  <div className="toolbar-meta">{filteredShowcases.length} systems</div>
                </div>

                <div className="video-grid">
                  {filteredShowcases.length > 0 ? (
                    filteredShowcases.map((item, index) => (
                      <article key={item.embed} className={`video-card reveal delay-${(index % 3) + 1}`}>
                        <VideoEmbed
                          title={item.title}
                          src={item.embed}
                          eager={index < eagerShowcaseCount}
                        />

                        <h3>{item.title}</h3>
                        <p>{item.desc}</p>

                        <div className="video-actions">
                          <a
                            href={getVideoUrl(item.embed)}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="video-open-btn"
                          >
                            Open Video
                          </a>
                        </div>
                      </article>
                    ))
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
                    {bigShowcases.map((item, index) => (
                      <article key={item.embed} className={`big-showcase-card reveal delay-${(index % 3) + 1}`}>
                        <VideoEmbed
                          title={item.title}
                          src={item.embed}
                          eager={!liteMode && index === 0}
                        />

                        <div className="big-showcase-copy">
                          <h4>{item.title}</h4>
                          <p>{item.credits}</p>
                          <p className="big-bio">{item.bio}</p>

                          <div className="video-actions">
                            <a
                              href={getVideoUrl(item.embed)}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="video-open-btn"
                            >
                              Open Video
                            </a>
                          </div>
                        </div>
                      </article>
                    ))}
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
                  <button type="button" className="close-btn" onClick={closePanel} aria-label="Close">
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

                  <a
                    href="https://discord.com/app"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="commission-ghost"
                  >
                    <MessageCircle className="mini" />
                    Discord
                  </a>

                  <a
                    href={DISCORD_INVITE}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="commission-ghost"
                  >
                    Server
                  </a>

                  <a
                    href={ROBLOX_PROFILE_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="commission-ghost"
                  >
                    Roblox
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
          margin: 0;
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

        * {
          box-sizing: border-box;
        }
      `}</style>

      <style jsx>{`
        .page-shell {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background: radial-gradient(circle at 50% 0%, #090909 0%, #040404 36%, #000 100%);
          color: #fff;
          isolation: isolate;
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
          transition: opacity 0.28s ease;
        }

        .page-loader {
          position: fixed;
          inset: 0;
          z-index: 90;
          display: grid;
          place-items: center;
          background: rgba(0, 0, 0, 0.62);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
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

        .loader-icon,
        .search-icon,
        .tier-icon,
        .policy-icon,
        .feature-icon {
          color: rgba(255, 255, 255, 0.85);
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

        .bg-aurora,
        .bg-beams,
        .bg-grid,
        .bg-spotlight,
        .bg-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .aurora-layer {
          transform: translate3d(calc(var(--mx) * 18px), calc(var(--my) * 14px), 0);
        }

        .beams-layer {
          transform: translate3d(calc(var(--mx) * 10px), calc(var(--my) * 8px), 0);
        }

        .grid-layer {
          transform: translate3d(calc(var(--mx) * 8px), calc(var(--my) * 8px), 0);
        }

        .bg-aurora {
          background:
            radial-gradient(circle at 50% 14%, rgba(255, 255, 255, 0.05), transparent 24%),
            radial-gradient(circle at 18% 30%, rgba(255, 255, 255, 0.025), transparent 20%),
            radial-gradient(circle at 82% 22%, rgba(255, 255, 255, 0.02), transparent 18%);
          animation: auroraDrift 14s ease-in-out infinite alternate;
        }

        .bg-beams {
          opacity: 0.22;
          background:
            linear-gradient(115deg, transparent 44%, rgba(255, 255, 255, 0.03) 49%, transparent 55%),
            linear-gradient(67deg, transparent 43%, rgba(255, 255, 255, 0.018) 49%, transparent 55%);
          background-size: 420px 420px, 360px 360px;
          animation: beamsDrift 20s linear infinite;
        }

        .bg-grid {
          opacity: 0.14;
          background-image: radial-gradient(circle, rgba(255, 255, 255, 0.14) 1px, transparent 1.2px);
          background-size: 24px 24px;
          background-position: calc(50% + var(--mx) * 6px) calc(50% + var(--my) * 6px);
        }

        .bg-spotlight {
          background:
            radial-gradient(420px circle at var(--cx) var(--cy), rgba(255, 255, 255, 0.08), transparent 58%),
            radial-gradient(150px circle at var(--cx) var(--cy), rgba(255, 255, 255, 0.05), transparent 62%);
          mix-blend-mode: screen;
          opacity: 0.9;
        }

        .bg-particles {
          overflow: hidden;
        }

        .dynamic-particle {
          position: absolute;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.95);
          box-shadow:
            0 0 8px rgba(255, 255, 255, 0.2),
            0 0 16px rgba(255, 255, 255, 0.06);
          filter: blur(var(--blur));
          opacity: var(--opacity-base);
          animation:
            twinklePulse ease-in-out infinite,
            particleFloat linear infinite;
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
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
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

        .presence-stack {
          display: grid;
          justify-items: center;
          gap: 8px;
          max-width: min(92vw, 420px);
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
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.07);
          color: #ffffff;
        }

        .badge-idle {
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.055);
          color: rgba(255, 255, 255, 0.88);
        }

        .badge-dnd {
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.045);
          color: rgba(255, 255, 255, 0.8);
        }

        .badge-offline {
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.035);
          color: rgba(255, 255, 255, 0.72);
        }

        .note-badge {
          max-width: 100%;
          padding: 8px 12px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.09);
          background: rgba(255, 255, 255, 0.03);
          color: rgba(255, 255, 255, 0.66);
          font-size: 11px;
          font-weight: 760;
          line-height: 1.35;
          text-align: center;
          word-break: break-word;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
        }

        .badge-online .dot,
        .badge-idle .dot,
        .badge-dnd .dot {
          background: #ffffff;
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.28);
        }

        .badge-offline .dot {
          background: rgba(255, 255, 255, 0.5);
          box-shadow: none;
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
          max-width: 1020px;
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
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.62));
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
          max-width: 720px;
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
          opacity: 0.72;
        }

        .skill-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          font-weight: 820;
          color: #f5f5f5;
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.12);
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
          color: #111;
          flex-shrink: 0;
        }

        .skill-mark.lua {
          background: linear-gradient(135deg, #ffffff, #9f9f9f);
        }

        .skill-mark.js {
          background: linear-gradient(135deg, #f2f2f2, #8c8c8c);
        }

        .skill-mark.cpp {
          background: linear-gradient(135deg, #e8e8e8, #7a7a7a);
        }

        .skill-mark.cs {
          background: linear-gradient(135deg, #dddddd, #6d6d6d);
        }

        .skill-mark.py {
          background: linear-gradient(135deg, #d2d2d2, #5f5f5f);
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

        .feature-grid,
        .workflow-grid {
          display: grid;
          gap: 14px;
          margin-top: 22px;
        }

        .feature-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .workflow-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .feature-card,
        .workflow-card {
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          padding: 18px;
          position: relative;
          overflow: hidden;
          text-align: left;
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.18);
          transition:
            transform 0.22s ease,
            border-color 0.22s ease,
            background 0.22s ease,
            box-shadow 0.22s ease;
        }

        .feature-card::before,
        .workflow-card::before,
        .video-card::before,
        .tier-card::before,
        .info-card::before,
        .policy-card::before,
        .big-showcase-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            140deg,
            rgba(255, 255, 255, 0.025),
            transparent 38%,
            transparent 62%,
            rgba(255, 255, 255, 0.015)
          );
          pointer-events: none;
        }

        .feature-icon {
          width: 34px;
          height: 34px;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.08);
          position: relative;
          z-index: 1;
        }

        .feature-card h3,
        .workflow-card h3 {
          margin: 14px 0 0;
          font-size: 18px;
          font-weight: 900;
          position: relative;
          z-index: 1;
        }

        .feature-card p,
        .workflow-card p {
          margin: 8px 0 0;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.58);
          position: relative;
          z-index: 1;
        }

        .workflow-num {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 44px;
          height: 28px;
          border-radius: 999px;
          padding: 0 10px;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.12em;
          color: rgba(255, 255, 255, 0.9);
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
          z-index: 1;
        }

        .overlay {
          position: fixed;
          inset: 0;
          z-index: 40;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: calc(88px + env(safe-area-inset-top, 0px)) 24px 24px;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          overflow-y: auto;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          animation: overlayIn 0.2s ease both;
        }

        .panel {
          position: relative;
          width: min(1120px, calc(100vw - 48px));
          max-width: 100%;
          max-height: min(
            calc(var(--app-vh, 100dvh) - 120px - env(safe-area-inset-top, 0px)),
            920px
          );
          min-height: 0;
          margin: 0 auto;
          overflow-x: hidden;
          overflow-y: auto;
          border-radius: 30px;
          padding: 24px;
          box-shadow:
            0 26px 80px rgba(0, 0, 0, 0.58),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          scrollbar-gutter: stable;
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
          animation: panelIn 0.24s cubic-bezier(0.18, 0.86, 0.24, 1) both;
        }

        .panel-head {
          position: sticky;
          top: -24px;
          z-index: 3;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 18px;
          padding: 0 0 12px;
          background: linear-gradient(to bottom, rgba(8, 8, 8, 0.98), rgba(8, 8, 8, 0.86), transparent);
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

        .close-btn,
        .search-clear {
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

        .search-clear {
          width: 30px;
          height: 30px;
          background: rgba(255, 255, 255, 0.05);
        }

        .close-btn:hover,
        .search-clear:hover {
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
          padding: 0 10px 0 14px;
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

        .video-card:hover,
        .tier-card:hover,
        .info-card:hover,
        .policy-card:hover,
        .big-showcase-card:hover,
        .feature-card:hover,
        .workflow-card:hover {
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

        .video-placeholder {
          width: 100%;
          aspect-ratio: 16 / 9;
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

        .lite-mode .bg-beams {
          display: none;
        }

        .lite-mode .bg-spotlight {
          opacity: 0.55;
        }

        .lite-mode .nav-shell,
        .lite-mode .panel,
        .lite-mode .page-loader {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .lite-mode .dynamic-particle {
          box-shadow:
            0 0 5px rgba(255, 255, 255, 0.14),
            0 0 10px rgba(255, 255, 255, 0.04);
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

        @keyframes panelIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
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
              18% 30%,
              82% 22%;
          }
          100% {
            background-position:
              53% 18%,
              14% 34%,
              86% 18%;
          }
        }

        @keyframes beamsDrift {
          0% {
            background-position:
              0 0,
              0 0;
          }
          100% {
            background-position:
              -44px 26px,
              26px -18px;
          }
        }

        @keyframes twinklePulse {
          0%,
          100% {
            opacity: calc(var(--opacity-base) * 0.52);
          }
          50% {
            opacity: var(--opacity-base);
          }
        }

        @keyframes particleFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(var(--drift-x), var(--drift-y), 0);
          }
        }

        @keyframes floatAvatar {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        @media (max-width: 980px) {
          .video-grid,
          .commission-grid,
          .policy-grid,
          .big-showcase-card,
          .workflow-grid,
          .feature-grid {
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

          .top-center {
            width: min(100%, calc(100% - 16px));
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
            align-items: flex-start;
            padding:
              calc(76px + env(safe-area-inset-top, 0px))
              12px
              calc(12px + env(safe-area-inset-bottom, 0px));
          }

          .panel {
            width: 100%;
            max-height: calc(
              var(--app-vh, 100dvh) - 88px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px)
            );
            border-radius: 24px;
            padding: 18px 18px calc(24px + env(safe-area-inset-bottom, 0px));
          }

          .panel-head {
            top: -18px;
          }

          .toolbar-row {
            align-items: stretch;
          }

          .search-shell {
            min-width: 0;
            max-width: none;
          }

          .note-badge {
            font-size: 10px;
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
        }

        @media (hover: none) {
          .tab-btn:hover,
          .main-btn:hover,
          .ghost-btn:hover,
          .commission-cta:hover,
          .commission-ghost:hover,
          .discord-callout-btn:hover,
          .video-open-btn:hover,
          .status-pill:hover,
          .stat-pill:hover,
          .cred-pill:hover,
          .skill-pill:hover,
          .close-btn:hover,
          .search-clear:hover,
          .video-card:hover,
          .tier-card:hover,
          .info-card:hover,
          .policy-card:hover,
          .big-showcase-card:hover,
          .feature-card:hover,
          .workflow-card:hover {
            transform: none;
            box-shadow: none;
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
