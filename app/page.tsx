"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import NextImage from "next/image";
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

type Panel = "none" | "reviews" | "showcase" | "commission";
type NavTab = "home" | "reviews" | "contact" | "showcase" | "commission";
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

type VouchItem = {
  author: string;
  tag: string;
  handle: string;
  userId?: string;
  profileUrl: string;
  date: string;
  quote: string;
  detail?: string;
  proof?: string;
  score: string;
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
const OPENING_SPLASH_MS = 2100;
const BRAND_USERNAME = "@KING NVRLIAM";
const ACTION_COOLDOWN_MS = 850;
const BG_MUSIC_SRC = "/portfolio-music.mp3";
const BG_MUSIC_VOLUME = 0.14;

const EMAIL_ADDRESS = "liamj7872@gmail.com";
const DISCORD_INVITE = "https://discord.gg/HksCmNvHxk";
const DISCORD_PROFILE_URL = `https://discord.com/users/${DISCORD_USER_ID}`;
const DISCORD_HANDLE = "streoooo";
const ROBLOX_PROFILE_URL = "https://www.roblox.com/users/4554029027/profile";

const MUSIC_STORAGE_KEY = "portfolio_music_enabled_v7";
const MUSIC_VOLUME_STORAGE_KEY = "portfolio_music_volume_v1";
const DEV_SHOWCASES_STORAGE_KEY = "portfolio_showcases_v1";
const DEV_VOUCHES_STORAGE_KEY = "portfolio_vouches_v2";
const DEV_PASSWORD = "best scripter";
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

const defaultShowcases: ShowcaseItem[] = [
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

const defaultVouches: VouchItem[] = [
  {
    author: "Voidedd",
    tag: "EDGE",
    handle: "@voidedd",
    profileUrl: DISCORD_PROFILE_URL,
    date: "Feb 9, 2026",
    quote: "Great scripting from @KING NVRLIAM with fast and clean delivery.",
    detail: "Consistent quality and reliable execution.",
    score: "5.0",
  },
  {
    author: "Vapix",
    tag: "Owner - The Bronx Shootout (2.8M+)",
    userId: "1352958517497167895",
    handle: "ID 1352958517497167895",
    profileUrl: "https://discord.com/users/1352958517497167895",
    date: "Feb 16, 2026",
    quote: "Big vouch to @KING NVRLIAM for explaining issues clearly and fixing them quickly.",
    detail: "Strong recommendation for top-tier scripting.",
    score: "5.0",
  },
  {
    author: "Mo27",
    tag: "BLGZ",
    handle: "@mo27",
    profileUrl: DISCORD_PROFILE_URL,
    date: "Mar 1, 2026",
    quote: "Massive vouch to @KING NVRLIAM. He is reliable, fast, and easy to work with.",
    detail: "Even when busy, he still over-delivers and communicates well.",
    score: "5.0",
  },
  {
    author: "esse",
    tag: "Verified Client",
    handle: "@esse",
    profileUrl: DISCORD_PROFILE_URL,
    date: "Mar 1, 2026",
    quote: "Vouch for @KING NVRLIAM. Fast work, reliable output, and strong quality.",
    detail: "Highly recommended for production game systems.",
    score: "5.0",
  },
  {
    author: "Suit Guy",
    tag: "Community Manager (500K-1M)",
    userId: "1148434561198461048",
    handle: "ID 1148434561198461048",
    profileUrl: "https://discord.com/users/1148434561198461048",
    date: "Mar 3, 2026",
    quote:
      "@KING NVRLIAM is an experienced scripter who does not delay or mislead clients.",
    detail:
      "He catches issues others miss, works under pressure, and consistently improves core systems.",
    score: "5.0",
  },
  {
    author: "Vetro",
    tag: "Vouched Client",
    userId: "990993180071723048",
    handle: "ID 990993180071723048",
    profileUrl: "https://discord.com/users/990993180071723048",
    date: "Mar 4, 2026",
    quote: "I vouch for @KING NVRLIAM. He is fast, creative, skilled, and reliable.",
    detail: "Reliable service and strong execution from start to finish.",
    score: "5.0",
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

function getVouchKey(item: Pick<VouchItem, "author" | "date" | "quote">) {
  return `${item.author.trim().toLowerCase()}|${item.date.trim().toLowerCase()}|${item.quote.trim().toLowerCase()}`;
}

function normalizeVouch(item: VouchItem): VouchItem {
  return {
    ...item,
    author: item.author?.trim() || "Client",
    tag: item.tag?.trim() || "Client",
    handle: item.handle?.trim() || "@client",
    userId: item.userId?.trim() || undefined,
    profileUrl: item.profileUrl?.trim() || DISCORD_PROFILE_URL,
    date: item.date?.trim() || "Unknown date",
    quote: item.quote?.trim() || "No review provided.",
    detail: item.detail?.trim() || "",
    proof: item.proof?.trim() || "",
    score: item.score?.trim() || "5.0",
  };
}

function mergeVouches(defaultList: VouchItem[], savedList: VouchItem[]) {
  const byKey = new Map<string, VouchItem>();

  for (const item of defaultList) {
    const normalized = normalizeVouch(item);
    byKey.set(getVouchKey(normalized), normalized);
  }

  for (const item of savedList) {
    const normalized = normalizeVouch(item);
    byKey.set(getVouchKey(normalized), normalized);
  }

  return Array.from(byKey.values());
}

function formatVouchQuote(quote: string) {
  const clean = quote.trim() || "No review provided.";
  const withMention = /@KING\s*NVRLIAM/i.test(clean) ? clean : `${clean} @KING NVRLIAM.`;
  if (/^10\s*\/\s*10\./i.test(withMention)) return withMention;
  return `10/10. ${withMention}`;
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
  const isInView = !enabled || inView;

  useLayoutEffect(() => {
    if (!enabled || inView) return;

    const node = ref.current;
    if (!node) return;

    if (!("IntersectionObserver" in window)) {
      const raf = requestAnimationFrame(() => setInView(true));
      return () => cancelAnimationFrame(raf);
    }

    let cancelled = false;
    const handleHit = () => {
      if (cancelled) return;
      setInView(true);
      observer.disconnect();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((entry) => entry.isIntersecting || entry.intersectionRatio > 0);
        if (hit) handleHit();
      },
      { rootMargin: "220px 0px" },
    );

    observer.observe(node);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [enabled, inView]);

  return { ref, inView: isInView };
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
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);

  const loaded = loadedSrc === src;
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
          onLoad={() => setLoadedSrc(src)}
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

export default function PortfolioPage() {
  const [panel, setPanel] = useState<Panel>("none");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const [emailCopied, setEmailCopied] = useState(false);
  const [estTime, setEstTime] = useState("04:51 PM");
  const [discordStatus, setDiscordStatus] = useState<DiscordPresence>(DISCORD_STATUS_ENABLED ? "offline" : "online");
  const [discordNote, setDiscordNote] = useState("");
  const [statusLoaded, setStatusLoaded] = useState(!DISCORD_STATUS_ENABLED);

  const [pageReady, setPageReady] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [musicVolume, setMusicVolume] = useState(BG_MUSIC_VOLUME);
  const [showcaseItems, setShowcaseItems] = useState<ShowcaseItem[]>(defaultShowcases);
  const [vouchItems, setVouchItems] = useState<VouchItem[]>(defaultVouches);
  const [devOpen, setDevOpen] = useState(false);
  const [devUnlocked, setDevUnlocked] = useState(false);
  const [devPasswordInput, setDevPasswordInput] = useState("");
  const [devError, setDevError] = useState("");
  const [reviewQuery, setReviewQuery] = useState("");
  const [reviewFilter, setReviewFilter] = useState<"all" | "5" | "4.5">("all");
  const [atTop, setAtTop] = useState(true);
  const [newShowcase, setNewShowcase] = useState<ShowcaseItem>({ title: "", embed: "", desc: "" });
  const [newVouch, setNewVouch] = useState<VouchItem>({
    author: "",
    tag: "",
    handle: "",
    userId: "",
    profileUrl: DISCORD_INVITE,
    date: "",
    quote: "",
    detail: "",
    score: "5.0",
  });
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [liteMode, setLiteMode] = useState(false);
  const [hideTopProfile, setHideTopProfile] = useState(false);
  const [homeTab, setHomeTab] = useState<"home" | "reviews" | "contact">("home");
  const [contactBusy, setContactBusy] = useState(false);
  const [bgPulse, setBgPulse] = useState({ x: 50, y: 45, key: 0 });

  const shellRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const vouchesRef = useRef<HTMLDivElement | null>(null);
  const contactRef = useRef<HTMLElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const copyTimerRef = useRef<number | null>(null);
  const fadeFrameRef = useRef<number | null>(null);
  const lastScrollYRef = useRef(0);
  const showcaseActionAtRef = useRef(0);
  const vouchActionAtRef = useRef(0);
  const contactActionAtRef = useRef(0);

  const reduceMotion = usePrefersReducedMotion();
  const pageVisible = usePageVisible();
  const modalOpen = panel !== "none";
  const activeTab: NavTab = panel === "none" ? homeTab : panel;

  const particleDots = useMemo(() => createParticleDots(liteMode ? 14 : 28), [liteMode]);
  const eagerShowcaseCount = liteMode ? 1 : 3;

  const preloadTargets = useMemo(() => {
    if (liteMode) return [];

    return Array.from(
      new Set([
        ...showcaseItems.slice(0, 2).map((item) => item.embed),
        ...bigShowcases.slice(0, 1).map((item) => item.embed),
      ]),
    );
  }, [liteMode, showcaseItems]);

  const openPanel = useCallback((next: Exclude<Panel, "none">) => {
    setPanel(next);
  }, []);

  const closePanel = useCallback(() => {
    setPanel("none");
    setHomeTab("home");
  }, []);

  const openReviewsPanel = useCallback(() => {
    setPanel("reviews");
  }, []);

  const scrollToContact = useCallback(() => {
    setPanel("none");
    setHomeTab("contact");

    const target = contactRef.current;
    if (!target) return;

    const navOffset = 132;
    const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - navOffset);
    window.scrollTo({ top, behavior: "smooth" });
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

  const unlockDevMode = useCallback(() => {
    if (devPasswordInput.trim().toLowerCase() !== DEV_PASSWORD) {
      setDevError("Wrong password.");
      return;
    }

    setDevUnlocked(true);
    setDevError("");
    setDevPasswordInput("");
  }, [devPasswordInput]);

  const addShowcase = useCallback(() => {
    const now = Date.now();
    if (now - showcaseActionAtRef.current < ACTION_COOLDOWN_MS) return;

    const title = newShowcase.title.trim();
    const embed = newShowcase.embed.trim();
    const desc = newShowcase.desc.trim();
    if (!title || !embed || !desc) return;

    const duplicate = showcaseItems.some(
      (item) => item.embed.trim().toLowerCase() === embed.toLowerCase(),
    );
    if (duplicate) return;

    showcaseActionAtRef.current = now;

    setShowcaseItems((prev) => [{ title, embed, desc }, ...prev]);
    setNewShowcase({ title: "", embed: "", desc: "" });
  }, [newShowcase, showcaseItems]);

  const addVouch = useCallback(() => {
    const now = Date.now();
    if (now - vouchActionAtRef.current < ACTION_COOLDOWN_MS) return;

    const author = newVouch.author.trim();
    const quote = newVouch.quote.trim();
    if (!author || !quote) return;

    const duplicate = vouchItems.some(
      (item) =>
        item.author.trim().toLowerCase() === author.toLowerCase() &&
        item.quote.trim().toLowerCase() === quote.toLowerCase(),
    );
    if (duplicate) return;

    vouchActionAtRef.current = now;

    const userId = newVouch.userId?.trim() ?? "";
    const profileUrl = userId ? `https://discord.com/users/${userId}` : newVouch.profileUrl.trim() || DISCORD_PROFILE_URL;

    setVouchItems((prev) => [
      {
        author,
        tag: newVouch.tag.trim() || "Client",
        handle: newVouch.handle.trim() || `@${author.toLowerCase().replace(/\s+/g, "")}`,
        userId,
        profileUrl,
        date: newVouch.date.trim() || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        quote,
        detail: newVouch.detail?.trim() || "",
        score: newVouch.score.trim() || "5.0",
      },
      ...prev,
    ]);

    setNewVouch({
      author: "",
      tag: "",
      handle: "",
      userId: "",
      profileUrl: DISCORD_PROFILE_URL,
      date: "",
      quote: "",
      detail: "",
      score: "5.0",
    });
  }, [newVouch, vouchItems]);

  const filteredShowcases = useMemo(() => {
    const value = deferredQuery.trim().toLowerCase();
    if (!value) return showcaseItems;

    return showcaseItems.filter(
      (item) =>
        item.title.toLowerCase().includes(value) ||
        item.desc.toLowerCase().includes(value),
    );
  }, [deferredQuery, showcaseItems]);

  const dedupedVouchItems = useMemo(() => {
    const byKey = new Map<string, VouchItem>();

    for (const item of vouchItems) {
      const author = item.author.trim().toLowerCase();
      const quote = item.quote.trim().toLowerCase();
      const key = `${author}|${quote}`;
      if (!byKey.has(key)) byKey.set(key, item);
    }

    return Array.from(byKey.values());
  }, [vouchItems]);

  const reviewStats = useMemo(() => {
    const total = dedupedVouchItems.length;
    const average =
      total === 0
        ? 0
        : dedupedVouchItems.reduce((sum, item) => sum + (Number(item.score) || 0), 0) / total;
    return { total, average };
  }, [dedupedVouchItems]);

  const filteredReviews = useMemo(() => {
    const queryValue = reviewQuery.trim().toLowerCase();

    return dedupedVouchItems.filter((item) => {
      const score = Number(item.score) || 0;
      const matchesFilter =
        reviewFilter === "all" ||
        (reviewFilter === "5" && score >= 4.95) ||
        (reviewFilter === "4.5" && score >= 4.5);

      if (!matchesFilter) return false;
      if (!queryValue) return true;

      const haystack = `${item.author} ${item.tag} ${item.handle} ${item.quote} ${item.detail ?? ""}`.toLowerCase();
      return haystack.includes(queryValue);
    });
  }, [dedupedVouchItems, reviewQuery, reviewFilter]);

  const getVouchProfileUrl = useCallback((item: VouchItem) => {
    if (item.userId && /^\d{17,20}$/.test(item.userId)) {
      return `https://discord.com/users/${item.userId}`;
    }

    const match = `${item.handle} ${item.profileUrl}`.match(/\d{17,20}/);
    if (match) return `https://discord.com/users/${match[0]}`;
    if (item.profileUrl?.startsWith("https://")) return item.profileUrl;
    return DISCORD_PROFILE_URL;
  }, []);

  const hasDirectVouchProfile = useCallback((item: VouchItem) => {
    if (item.userId && /^\d{17,20}$/.test(item.userId)) return true;
    return Boolean(`${item.handle} ${item.profileUrl}`.match(/\d{17,20}/));
  }, []);

  const getVouchAvatarUrl = useCallback((item: VouchItem) => {
    const match = `${item.userId ?? ""} ${item.handle} ${item.profileUrl}`.match(/\d{17,20}/);
    if (match) return `https://unavatar.io/discord/${match[0]}`;
    return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(item.author)}`;
  }, []);

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
        sleep(INITIAL_BOOT_MS + OPENING_SPLASH_MS),
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

      const savedVolume = window.localStorage.getItem(MUSIC_VOLUME_STORAGE_KEY);
      if (savedVolume !== null) {
        const parsed = Number(savedVolume);
        if (Number.isFinite(parsed)) {
          setMusicVolume(clamp01(parsed));
        }
      }

      const savedShowcases = window.localStorage.getItem(DEV_SHOWCASES_STORAGE_KEY);
      if (savedShowcases) {
        const parsed = JSON.parse(savedShowcases) as ShowcaseItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setShowcaseItems(parsed);
        }
      }

      const savedVouches = window.localStorage.getItem(DEV_VOUCHES_STORAGE_KEY);
      if (savedVouches) {
        const parsed = JSON.parse(savedVouches) as VouchItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const allowedKeys = new Set(defaultVouches.map((entry) => getVouchKey(normalizeVouch(entry))));
          const screenshotOnly = parsed.filter((entry) => allowedKeys.has(getVouchKey(normalizeVouch(entry))));
          setVouchItems(mergeVouches(defaultVouches, screenshotOnly));
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(MUSIC_STORAGE_KEY, musicEnabled ? "1" : "0");
    } catch {}
  }, [musicEnabled]);

  useEffect(() => {
    try {
      window.localStorage.setItem(MUSIC_VOLUME_STORAGE_KEY, clamp01(musicVolume).toFixed(2));
    } catch {}
  }, [musicVolume]);

  useEffect(() => {
    try {
      window.localStorage.setItem(DEV_SHOWCASES_STORAGE_KEY, JSON.stringify(showcaseItems));
    } catch {}
  }, [showcaseItems]);

  useEffect(() => {
    try {
      window.localStorage.setItem(DEV_VOUCHES_STORAGE_KEY, JSON.stringify(vouchItems));
    } catch {}
  }, [vouchItems]);

  useEffect(() => {
    const onHotkey = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "d") {
        event.preventDefault();
        setDevOpen(true);
      }
    };

    window.addEventListener("keydown", onHotkey);
    return () => window.removeEventListener("keydown", onHotkey);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const time = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "America/New_York",
      });
      setEstTime(time);
    };

    updateTime();
    const timer = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let frame = 0;

    const applyScroll = () => {
      const currentY = Math.max(window.scrollY, document.documentElement.scrollTop, document.body.scrollTop);
      const delta = currentY - lastScrollYRef.current;
      const goingDown = delta > 2;
      const goingUp = delta < -2;
      const pastThreshold = currentY > 88;
      const isExactlyTop = currentY <= 2;
      setAtTop(isExactlyTop);

      if (panel === "none") {
        const markerY = 180;
        let nextTab: "home" | "reviews" | "contact" = "home";

        if (contactRef.current) {
          const contactRect = contactRef.current.getBoundingClientRect();
          if (contactRect.top <= markerY && contactRect.bottom >= markerY) {
            nextTab = "contact";
          }
        }

        if (nextTab === "home" && vouchesRef.current) {
          const reviewsRect = vouchesRef.current.getBoundingClientRect();
          if (reviewsRect.top <= markerY && reviewsRect.bottom >= markerY) {
            nextTab = "reviews";
          }
        }

        setHomeTab((prev) => (prev === nextTab ? prev : nextTab));
      }

      if (!pastThreshold || isExactlyTop) {
        setHideTopProfile(false);
      } else if (goingDown) {
        setHideTopProfile(true);
      } else if (goingUp) {
        setHideTopProfile(false);
      }

      lastScrollYRef.current = currentY;
    };

    const onScroll = () => {
      if (frame !== 0) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        applyScroll();
      });
    };

    lastScrollYRef.current = Math.max(window.scrollY, document.documentElement.scrollTop, document.body.scrollTop);
    applyScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, [panel]);

  const toggleMusicEnabled = useCallback(() => {
    setMusicEnabled((prev) => {
      const next = !prev;

      if (next && musicVolume <= 0.001) {
        setMusicVolume(BG_MUSIC_VOLUME);
      }

      return next;
    });
  }, [musicVolume]);

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
    const shell = shellRef.current;
    if (!shell || reduceMotion) return;

    const onPointerDown = (event: PointerEvent) => {
      const rect = shell.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 100;
      const y = ((event.clientY - rect.top) / Math.max(rect.height, 1)) * 100;
      setBgPulse({ x: clamp(x, 0, 100), y: clamp(y, 0, 100), key: Date.now() });
    };

    shell.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => shell.removeEventListener("pointerdown", onPointerDown);
  }, [reduceMotion]);

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

    const targetVolume = clamp01(liteMode ? Math.min(musicVolume, 0.08) : musicVolume);

    const startMusic = () => {
      if (!musicEnabled || disposed || !pageVisible) return;

      clearPauseTimer();

      if (!audio.paused) {
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
            fadeVolume(clamp01(audio.volume), targetVolume, 300);
          })
          .catch(() => {});
      } else {
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
  }, [musicEnabled, pageVisible, liteMode, musicVolume]);

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

      <div
        key={bgPulse.key}
        className="bg-pulse"
        aria-hidden="true"
        style={{ "--pulse-x": `${bgPulse.x}%`, "--pulse-y": `${bgPulse.y}%` } as CSSVars}
      />

      {!pageReady && (
        <div className="page-loader" aria-hidden="true">
          <div className="opening-loader-card">
            <Music2 className="mini loader-icon" />
            <span className="opening-kicker"></span>
            <h1 className="opening-name">{BRAND_USERNAME}</h1>
            <span className="opening-sub">Initializing portfolio...</span>
            <span className="opening-eq">
              <span />
              <span />
              <span />
              <span />
            </span>
          </div>
        </div>
      )}

      <header className="top-stack reveal">
        <div className="top-stack-inner">
          <div className="top-center">
            <div className="top-nav-row">
              <div className="music-icon-slot music-icon-slot-left" aria-hidden="true" />

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
                  className={`tab-btn ${activeTab === "reviews" ? "is-active" : ""}`}
                  onClick={openReviewsPanel}
                >
                  Reviews
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "contact" ? "is-active" : ""}`}
                  onClick={scrollToContact}
                >
                  Contact
                </button>
                <button
                  type="button"
                  className={`tab-btn ${activeTab === "commission" ? "is-active" : ""}`}
                  onClick={() => openPanel("commission")}
                >
                  Commission Me
                </button>
              </nav>

              <div className="music-icon-slot">
                <button
                  type="button"
                  className={`music-icon-btn ${atTop ? "is-visible" : "is-hidden"}`}
                  onClick={toggleMusicEnabled}
                  aria-label={musicEnabled ? "Turn music off" : "Turn music on"}
                  aria-pressed={musicEnabled}
                  title={musicEnabled ? "Music On" : "Music Off"}
                  tabIndex={atTop ? 0 : -1}
                  aria-hidden={!atTop}
                >
                  {musicEnabled ? <Volume2 className="mini" /> : <VolumeX className="mini" />}
                </button>
              </div>
            </div>

            <div className={`top-profile ${hideTopProfile ? "is-hidden" : ""}`}>
              <NextImage
                src={avatarSources[avatarIndex]}
                alt="Profile"
                className="avatar"
                width={56}
                height={56}
                unoptimized
                priority
                onError={() => {
                  setAvatarIndex((prev) => (prev < avatarSources.length - 1 ? prev + 1 : prev));
                }}
              />

              <div className="presence-stack">
                <div className={`badge badge-${discordStatus}`} title={statusText}>
                  <span className="dot" aria-hidden="true" />
                  <span>{statusText}</span>
                </div>

                {discordNote && (
                  <div className="note-badge" title={discordNote}>
                    {discordNote}
                  </div>
                )}
              </div>
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
            Smooth presentation, stable logic, and code that will not fall apart later.
          </p>

          <div className="discord-callout reveal delay-3">
            <span>Join the Discord server to see the full portfolio</span>
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

          <section ref={vouchesRef} className="vouches-shell reveal delay-3" id="reviews">
            <div className="section-title-row">
              <span className="section-angle">&gt;</span>
              <h2 className="section-title">
                <span>What</span> Clients Say
              </h2>
            </div>

            <div className="vouches-grid">
              {dedupedVouchItems.slice(0, 3).map((item) => {
                const profileUrl = getVouchProfileUrl(item);
                const avatarUrl = getVouchAvatarUrl(item);
                const profileLabel = hasDirectVouchProfile(item) ? "View Profile" : "Open Discord";
                const quoteText = formatVouchQuote(item.quote);

                return (
                  <article key={`${item.author}-${item.date}`} className="vouch-card">
                    <p className="vouch-quote">&quot;{quoteText}&quot;</p>
                    {item.detail && <p className="vouch-detail">{item.detail}</p>}

                    <div className="vouch-foot">
                      <div className="vouch-profile">
                        <span
                          className={`vouch-avatar ${avatarUrl ? "has-image" : ""}`}
                          aria-hidden="true"
                          style={avatarUrl ? ({ backgroundImage: `url(${avatarUrl})` } as CSSProperties) : undefined}
                        >
                          {item.author.slice(0, 1).toUpperCase()}
                        </span>
                        <div>
                          <h3>{item.author}</h3>
                          <p className="vouch-role">{item.tag}</p>
                        </div>
                      </div>
                      <span className="vouch-stars" aria-label={`Rating ${item.score} out of 5`}>
                        ★★★★★
                      </span>
                    </div>
                    <a href={profileUrl} target="_blank" rel="noreferrer noopener" className="vouch-link">
                      {profileLabel}
                    </a>
                  </article>
                );
              })}
            </div>

            <a href={DISCORD_INVITE} target="_blank" rel="noreferrer noopener" className="vouches-more">
              Read all reviews <ArrowUpRight className="mini" />
            </a>
          </section>

          <section ref={contactRef} className="contact-shell reveal delay-3" id="contact">
            <div className="section-title-row">
              <span className="section-angle">&gt;</span>
              <h2 className="section-title">Contact</h2>
            </div>

            <div className="contact-board">
              <div className="contact-discord-row">
                <div className="contact-discord-icon">
                  <MessageCircle className="mini" />
                </div>

                <div className="contact-discord-meta">
                  <span>DISCORD</span>
                  <strong>Liam • {DISCORD_HANDLE}</strong>
                  <small>EST • {estTime}</small>
                </div>
              </div>

              <form
                className="contact-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  const now = Date.now();
                  if (now - contactActionAtRef.current < ACTION_COOLDOWN_MS) return;
                  contactActionAtRef.current = now;
                  setContactBusy(true);
                  window.open(DISCORD_PROFILE_URL, "_blank", "noopener,noreferrer");
                  window.setTimeout(() => setContactBusy(false), 650);
                }}
              >
                <div className="contact-field-grid">
                  <label className="contact-field">
                    <span>NAME</span>
                    <input type="text" placeholder="Your name" />
                  </label>

                  <label className="contact-field">
                    <span>EMAIL</span>
                    <input type="email" placeholder="your@email.com" />
                  </label>
                </div>

                <label className="contact-field contact-field-full">
                  <span>MESSAGE</span>
                  <textarea placeholder="Your message..." rows={6} />
                </label>

                <button type="submit" className="contact-send-btn" disabled={contactBusy}>
                  <ArrowUpRight className="mini" /> {contactBusy ? "Opening..." : "Send Message"}
                </button>
              </form>

              <p className="contact-footer">© 2026 Liam · {DISCORD_HANDLE}</p>
            </div>
          </section>
        </section>
      </div>

      {devOpen && (
        <div className="dev-overlay" onClick={() => setDevOpen(false)}>
          <section className="dev-panel" onClick={(event) => event.stopPropagation()}>
            {!devUnlocked ? (
              <>
                <div className="dev-terminal">
                  <div className="dev-terminal-head">
                    <span className="dev-dot red" />
                    <span className="dev-dot amber" />
                    <span className="dev-dot green" />
                  </div>
                  <div className="dev-terminal-body">
                    <p>{"> profile: @KING NVRLIAM"}</p>
                    <p>{"> mode: portfolio editor"}</p>
                    <p>{"> showcase systems: live"} <span>ready</span></p>
                    <p>{"> vouch records: synced"} <span>ready</span></p>
                    <p>{"> top navigation: active"} <span>ready</span></p>
                    <p>{"> background music: armed"} <span>ready</span></p>
                    <p className="dev-access">[ACCESS LOCKED]</p>
                  </div>
                </div>

                <div className="dev-auth">
                  <h3>Creator Access</h3>
                  <p>Press Ctrl + Shift + D any time to open your editor panel.</p>
                  <input
                    type="password"
                    value={devPasswordInput}
                    onChange={(event) => {
                      setDevPasswordInput(event.target.value);
                      if (devError) setDevError("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        unlockDevMode();
                      }
                    }}
                    className="dev-input"
                    placeholder="Enter password"
                    aria-label="Dev mode password"
                  />
                  {devError && <p className="dev-error">{devError}</p>}
                  <button type="button" className="dev-btn" onClick={unlockDevMode}>
                    Unlock Edit Mode
                  </button>
                </div>
              </>
            ) : (
              <div className="dev-editor">
                <div className="dev-editor-head">
                  <div>
                    <h3>Edit Mode</h3>
                    <p>Manage showcases and vouches for @KING NVRLIAM.</p>
                  </div>
                  <button type="button" className="dev-btn ghost" onClick={() => setDevOpen(false)}>
                    Close
                  </button>
                </div>

                <div className="dev-grid">
                  <section className="dev-card">
                    <h4>Add Showcase</h4>
                    <input
                      className="dev-input"
                      placeholder="Title"
                      value={newShowcase.title}
                      onChange={(event) => setNewShowcase((prev) => ({ ...prev, title: event.target.value }))}
                    />
                    <input
                      className="dev-input"
                      placeholder="Embed URL"
                      value={newShowcase.embed}
                      onChange={(event) => setNewShowcase((prev) => ({ ...prev, embed: event.target.value }))}
                    />
                    <input
                      className="dev-input"
                      placeholder="Short description"
                      value={newShowcase.desc}
                      onChange={(event) => setNewShowcase((prev) => ({ ...prev, desc: event.target.value }))}
                    />
                    <button type="button" className="dev-btn" onClick={addShowcase}>
                      Add Showcase
                    </button>
                    <div className="dev-list">
                      {showcaseItems.map((item) => (
                        <div key={`${item.title}-${item.embed}`} className="dev-list-row">
                          <span>{item.title}</span>
                          <button
                            type="button"
                            className="dev-mini-btn"
                            onClick={() => setShowcaseItems((prev) => prev.filter((entry) => entry.embed !== item.embed))}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="dev-card">
                    <h4>Add Vouch</h4>
                    <input
                      className="dev-input"
                      placeholder="Author"
                      value={newVouch.author}
                      onChange={(event) => setNewVouch((prev) => ({ ...prev, author: event.target.value }))}
                    />
                    <input
                      className="dev-input"
                      placeholder="Tag (for example: Project Manager)"
                      value={newVouch.tag}
                      onChange={(event) => setNewVouch((prev) => ({ ...prev, tag: event.target.value }))}
                    />
                    <input
                      className="dev-input"
                      placeholder="Handle (for example: @name)"
                      value={newVouch.handle}
                      onChange={(event) => setNewVouch((prev) => ({ ...prev, handle: event.target.value }))}
                    />
                    <input
                      className="dev-input"
                      placeholder="Discord User ID"
                      value={newVouch.userId ?? ""}
                      onChange={(event) => setNewVouch((prev) => ({ ...prev, userId: event.target.value }))}
                    />
                    <input
                      className="dev-input"
                      placeholder="Profile URL"
                      value={newVouch.profileUrl}
                      onChange={(event) => setNewVouch((prev) => ({ ...prev, profileUrl: event.target.value }))}
                    />
                    <input
                      className="dev-input"
                      placeholder="Date"
                      value={newVouch.date}
                      onChange={(event) => setNewVouch((prev) => ({ ...prev, date: event.target.value }))}
                    />
                    <input
                      className="dev-input"
                      placeholder="Score (for example: 5.0)"
                      value={newVouch.score}
                      onChange={(event) => setNewVouch((prev) => ({ ...prev, score: event.target.value }))}
                    />
                    <textarea
                      className="dev-input dev-textarea"
                      placeholder="Quote"
                      value={newVouch.quote}
                      onChange={(event) => setNewVouch((prev) => ({ ...prev, quote: event.target.value }))}
                    />
                    <textarea
                      className="dev-input dev-textarea"
                      placeholder="Extra detail"
                      value={newVouch.detail}
                      onChange={(event) => setNewVouch((prev) => ({ ...prev, detail: event.target.value }))}
                    />
                    <button type="button" className="dev-btn" onClick={addVouch}>
                      Add Vouch
                    </button>
                    <div className="dev-list">
                      {dedupedVouchItems.map((item) => (
                        <div key={`${item.author}-${item.date}-${item.quote}`} className="dev-list-row">
                          <span>{item.author}</span>
                          <button
                            type="button"
                            className="dev-mini-btn"
                            onClick={() =>
                              setVouchItems((prev) => prev.filter((entry) => !(entry.author === item.author && entry.quote === item.quote)))
                            }
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {panel !== "none" && (
        <div className="overlay" onClick={closePanel}>
          <section
            ref={panelRef}
            className={`panel ${panel === "showcase" ? "panel-showcase" : panel === "reviews" ? "panel-reviews" : "panel-commission"} panel-opening`}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={panel === "showcase" ? "Showcase" : panel === "reviews" ? "Reviews" : "Commission me"}
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
            ) : panel === "reviews" ? (
              <>
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">Reviews</p>
                    <h2>Vouches & Testimonials</h2>
                  </div>
                  <button type="button" className="close-btn" onClick={closePanel} aria-label="Close">
                    <X className="mini" />
                  </button>
                </div>

                <section className="reviews-intro-block">
                  <h3>Vouches / Testimonials</h3>
                  <p className="reviews-big-warning">Vouches are new, so there are not a lot yet.</p>
                  <p>
                    This page logs real client feedback. Every completed project review will be kept here.
                  </p>
                  <p>Only verified client feedback is posted.</p>
                  <p>Each review includes who posted it, what was delivered, when it was completed, and proof when available.</p>
                  <p>
                    Worked with me before and want to leave a vouch? Ping me or DM me directly.
                  </p>
                </section>

                <div className="reviews-stat-row">
                  <div className="reviews-stat-card">
                    <strong>{reviewStats.total}</strong>
                    <span>Total Reviews</span>
                  </div>
                  <div className="reviews-stat-card">
                    <strong>{reviewStats.average.toFixed(2)}</strong>
                    <span>Average Rating</span>
                  </div>
                </div>

                <div className="reviews-toolbar">
                  <input
                    value={reviewQuery}
                    onChange={(event) => setReviewQuery(event.target.value)}
                    placeholder="Search reviews..."
                    className="reviews-search"
                    aria-label="Search reviews"
                  />
                  <button
                    type="button"
                    className={`reviews-filter ${reviewFilter === "all" ? "is-active" : ""}`}
                    onClick={() => setReviewFilter("all")}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className={`reviews-filter ${reviewFilter === "5" ? "is-active" : ""}`}
                    onClick={() => setReviewFilter("5")}
                  >
                    5 Stars
                  </button>
                  <button
                    type="button"
                    className={`reviews-filter ${reviewFilter === "4.5" ? "is-active" : ""}`}
                    onClick={() => setReviewFilter("4.5")}
                  >
                    4.5 Stars
                  </button>
                </div>

                <div className="reviews-grid-panel">
                  {filteredReviews.length > 0 ? (
                    filteredReviews.map((item) => {
                      const profileUrl = getVouchProfileUrl(item);
                      const avatarUrl = getVouchAvatarUrl(item);
                      const profileLabel = hasDirectVouchProfile(item) ? "View Profile" : "Open Discord";
                      const quoteText = formatVouchQuote(item.quote);

                      return (
                        <article key={`${item.author}-${item.date}-${item.quote}`} className="review-panel-card">
                          <p className="review-panel-quote">&quot;{quoteText}&quot;</p>
                          {item.detail && <p className="review-panel-detail">{item.detail}</p>}

                          <div className="review-panel-foot">
                            <div className="vouch-profile">
                              <span
                                className={`vouch-avatar ${avatarUrl ? "has-image" : ""}`}
                                aria-hidden="true"
                                style={avatarUrl ? ({ backgroundImage: `url(${avatarUrl})` } as CSSProperties) : undefined}
                              >
                                {item.author.slice(0, 1).toUpperCase()}
                              </span>
                              <div>
                                <h3>{item.author}</h3>
                                <p className="vouch-role">{item.tag}</p>
                              </div>
                            </div>
                            <span className="vouch-stars" aria-label={`Rating ${item.score} out of 5`}>
                              ★★★★★
                            </span>
                          </div>

                          <div className="review-panel-actions">
                            <span className="review-panel-date">{item.date}</span>
                            <a href={profileUrl} target="_blank" rel="noreferrer noopener" className="vouch-link">
                              {profileLabel}
                            </a>
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <div className="empty-card">
                      <h3>No matching reviews</h3>
                      <p>Try another keyword or filter.</p>
                    </div>
                  )}
                </div>
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
          background:
            radial-gradient(circle at 50% -10%, rgba(255, 255, 255, 0.1), transparent 34%),
            radial-gradient(circle at 12% 22%, rgba(255, 255, 255, 0.05), transparent 38%),
            radial-gradient(circle at 86% 26%, rgba(255, 255, 255, 0.06), transparent 42%),
            linear-gradient(180deg, #090909 0%, #040404 38%, #000 100%);
          color: #fff;
          isolation: isolate;
          --mx: 0;
          --my: 0;
          --cx: 50%;
          --cy: 45%;
          touch-action: pan-y;
        }

        .page-shell.booting .top-stack,
        .page-shell.booting .wrap {
          opacity: 0;
          transform: translateY(10px) scale(0.995);
          pointer-events: none;
        }

        .page-shell.ready .top-stack,
        .page-shell.ready .wrap {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .top-stack,
        .wrap {
          transition: opacity 0.55s ease, transform 0.55s cubic-bezier(0.2, 0.7, 0.2, 1);
          will-change: transform, opacity;
        }

        .page-loader {
          position: fixed;
          inset: 0;
          z-index: 70;
          display: grid;
          place-items: center;
          background:
            radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.12), rgba(0, 0, 0, 0) 38%),
            rgba(0, 0, 0, 0.88);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          animation: overlayIn 0.35s ease both;
        }

        .opening-loader-card {
          min-width: min(520px, calc(100vw - 36px));
          display: grid;
          justify-items: center;
          align-items: center;
          gap: 10px;
          border-radius: 22px;
          padding: 20px 22px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5);
          text-align: center;
          animation: splashEnter 0.45s cubic-bezier(0.2, 0.9, 0.2, 1) both;
        }

        .loader-icon,
        .search-icon,
        .tier-icon,
        .policy-icon,
        .feature-icon {
          color: rgba(255, 255, 255, 0.85);
        }

        .opening-kicker {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          font-weight: 820;
          color: rgba(255, 255, 255, 0.65);
        }

        .opening-name {
          margin: 0;
          font-size: clamp(28px, 5vw, 52px);
          line-height: 0.94;
          letter-spacing: -0.03em;
          font-weight: 930;
          color: #fff;
          text-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
        }

        .opening-sub {
          font-size: 13px;
          font-weight: 760;
          color: rgba(255, 255, 255, 0.92);
        }

        .opening-eq {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .opening-eq span {
          width: 6px;
          height: 14px;
          border-radius: 999px;
          background: #fff;
          opacity: 0.4;
          transform-origin: bottom center;
          animation: eqBounce 0.72s ease-in-out infinite;
        }

        .opening-eq span:nth-child(2) {
          animation-delay: 0.12s;
        }

        .opening-eq span:nth-child(3) {
          animation-delay: 0.24s;
        }

        .opening-eq span:nth-child(4) {
          animation-delay: 0.34s;
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
            radial-gradient(circle at 52% 12%, rgba(255, 255, 255, 0.1), transparent 30%),
            radial-gradient(circle at 18% 34%, rgba(255, 255, 255, 0.05), transparent 28%),
            radial-gradient(circle at 84% 18%, rgba(255, 255, 255, 0.05), transparent 24%);
          animation: auroraDrift 14s ease-in-out infinite alternate;
        }

        .bg-beams {
          opacity: 0.34;
          background:
            linear-gradient(115deg, transparent 42%, rgba(255, 255, 255, 0.08) 50%, transparent 58%),
            linear-gradient(67deg, transparent 42%, rgba(255, 255, 255, 0.06) 50%, transparent 58%);
          background-size: 420px 420px, 360px 360px;
          animation: beamsDrift 20s linear infinite;
        }

        .bg-grid {
          opacity: 0.2;
          background-image: radial-gradient(circle, rgba(255, 255, 255, 0.16) 1px, transparent 1.2px);
          background-size: 24px 24px;
          background-position: calc(50% + var(--mx) * 6px) calc(50% + var(--my) * 6px);
        }

        .bg-spotlight {
          background:
            radial-gradient(460px circle at var(--cx) var(--cy), rgba(255, 255, 255, 0.12), transparent 60%),
            radial-gradient(180px circle at var(--cx) var(--cy), rgba(255, 255, 255, 0.08), transparent 66%);
          mix-blend-mode: screen;
          opacity: 0.8;
        }

        .bg-particles {
          overflow: hidden;
        }

        .bg-pulse {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(
            220px circle at var(--pulse-x) var(--pulse-y),
            rgba(255, 255, 255, 0.18),
            rgba(255, 255, 255, 0.08) 26%,
            transparent 62%
          );
          mix-blend-mode: screen;
          opacity: 0;
          animation: pulseFade 0.7s ease-out both;
          z-index: 1;
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

        .top-stack-inner {
          position: relative;
          width: min(1120px, calc(100% - 18px));
          margin: 0 auto;
          pointer-events: none;
        }

        .top-center {
          pointer-events: auto;
          width: 100%;
          margin: 0 auto;
          display: grid;
          justify-items: center;
          gap: 10px;
        }

        .top-nav-row {
          width: 100%;
          display: grid;
          grid-template-columns: 40px 1fr 40px;
          align-items: center;
          gap: 10px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 999px;
          padding: 6px;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.32);
          transition: transform 0.32s ease, box-shadow 0.32s ease, border-color 0.32s ease;
        }

        .music-icon-slot {
          width: 40px;
          height: 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .music-icon-slot-left {
          visibility: hidden;
          pointer-events: none;
        }

        .music-icon-btn {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          padding: 0;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.3);
          pointer-events: auto;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.9);
          transition: transform 0.28s ease, background 0.28s ease, border-color 0.28s ease, opacity 0.28s ease;
        }

        .music-icon-btn.is-hidden {
          opacity: 0;
          pointer-events: none;
        }

        .music-icon-btn.is-visible {
          opacity: 1;
        }

        .music-icon-btn:hover {
          transform: translateY(-1px);
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.1);
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
          border-color: rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          width: fit-content;
          max-width: 100%;
          transition: transform 0.28s ease, box-shadow 0.28s ease;
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
          transition: transform 0.26s ease, background 0.26s ease, color 0.26s ease;
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
          transition: opacity 0.24s ease, transform 0.24s ease, max-height 0.24s ease, margin 0.24s ease;
          max-height: 180px;
          opacity: 1;
          transform: translateY(0);
        }

        .top-profile.is-hidden {
          opacity: 0;
          transform: translateY(-10px);
          max-height: 0;
          margin-top: -4px;
          pointer-events: none;
          overflow: hidden;
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

        .vouches-shell {
          margin-top: 30px;
          width: min(1020px, 100%);
          margin-left: auto;
          margin-right: auto;
          text-align: center;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 22px;
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.22);
        }

        .section-title-row {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
        }

        .section-angle {
          color: rgba(255, 255, 255, 0.78);
          font-size: clamp(26px, 3.2vw, 44px);
          font-weight: 900;
          line-height: 0.9;
        }

        .section-title {
          margin: 0;
          font-size: clamp(30px, 4vw, 54px);
          letter-spacing: -0.01em;
          font-weight: 900;
          color: #f2f2f2;
        }

        .section-title span {
          color: #fff;
        }

        .vouches-grid {
          margin-top: 20px;
          display: grid;
          gap: 16px;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .vouch-card {
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
          padding: 16px;
          position: relative;
          overflow: hidden;
          text-align: left;
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.18);
          transition:
            transform 0.22s ease,
            border-color 0.22s ease,
            background 0.22s ease,
            box-shadow 0.22s ease;
        }

        .vouch-quote {
          margin: 0;
          line-height: 1.6;
          color: rgba(243, 243, 243, 0.86);
          font-style: italic;
          font-size: 14px;
          min-height: 96px;
          position: relative;
          z-index: 1;
        }

        .vouch-detail {
          margin: 8px 0 0;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.58);
          font-size: 13px;
          min-height: 42px;
        }

        .vouch-foot {
          margin-top: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .vouch-profile {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }

        .vouch-avatar {
          width: 30px;
          height: 30px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.06);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.92);
          flex-shrink: 0;
        }

        .vouch-avatar.has-image {
          color: transparent;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          border-color: rgba(255, 255, 255, 0.26);
        }

        .vouch-head h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 900;
        }

        .vouch-role {
          margin: 2px 0 0;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.62);
          letter-spacing: 0;
          text-transform: none;
          font-weight: 700;
        }

        .vouch-stars {
          color: #fff;
          font-size: 13px;
          letter-spacing: 0.06em;
          font-weight: 900;
        }

        .vouch-link {
          margin-top: 10px;
          display: inline-flex;
          border-radius: 999px;
          padding: 6px 11px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.9);
          text-decoration: none;
          font-size: 10px;
          font-weight: 760;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          position: relative;
          z-index: 1;
        }

        .vouches-more {
          margin: 18px auto 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          color: rgba(255, 255, 255, 0.92);
          text-decoration: none;
          font-size: 14px;
          font-weight: 760;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }

        .contact-shell {
          margin-top: 28px;
          width: min(1020px, 100%);
          margin-left: auto;
          margin-right: auto;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 22px;
          text-align: center;
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 18px 44px rgba(0, 0, 0, 0.22);
        }

        .contact-board {
          margin-top: 18px;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 18px;
          display: grid;
          gap: 14px;
          background: rgba(255, 255, 255, 0.03);
        }

        .contact-discord-row {
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.02);
          min-height: 78px;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 0 16px;
        }

        .contact-discord-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .contact-discord-meta {
          display: grid;
          gap: 3px;
          text-align: left;
        }

        .contact-discord-meta span,
        .contact-discord-meta small {
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.58);
          font-weight: 760;
        }

        .contact-discord-meta strong {
          font-size: 24px;
          line-height: 1.1;
          color: #fff;
          letter-spacing: -0.01em;
          font-weight: 900;
        }

        .contact-form {
          display: grid;
          gap: 12px;
        }

        .contact-field-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .contact-field {
          display: grid;
          gap: 7px;
          text-align: left;
        }

        .contact-field span {
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.55);
          font-weight: 760;
        }

        .contact-field input,
        .contact-field textarea {
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.03);
          color: #fff;
          font: inherit;
          padding: 12px 14px;
          outline: none;
          transition: border-color 0.2s ease, background 0.2s ease;
        }

        .contact-field input::placeholder,
        .contact-field textarea::placeholder {
          color: rgba(255, 255, 255, 0.34);
        }

        .contact-field input:focus,
        .contact-field textarea:focus {
          border-color: rgba(255, 255, 255, 0.28);
          background: rgba(255, 255, 255, 0.05);
        }

        .contact-field-full {
          grid-column: 1 / -1;
        }

        .contact-send-btn {
          min-height: 50px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          font: inherit;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 12px;
          font-weight: 860;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
        }

        .contact-send-btn:hover {
          transform: translateY(-1px);
          border-color: rgba(255, 255, 255, 0.24);
          background: rgba(255, 255, 255, 0.08);
        }

        .contact-send-btn:disabled {
          opacity: 0.64;
          transform: none;
          cursor: not-allowed;
        }

        .contact-footer {
          margin: 6px 0 0;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.44);
        }

        .dev-overlay {
          position: fixed;
          inset: 0;
          z-index: 52;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 22px;
          background: rgba(0, 0, 0, 0.82);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          animation: overlayIn 0.22s ease both;
        }

        .dev-panel {
          width: min(980px, calc(100vw - 44px));
          max-height: min(860px, calc(100vh - 44px));
          overflow: auto;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: linear-gradient(180deg, rgba(14, 14, 14, 0.95), rgba(8, 8, 8, 0.98));
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.56);
          padding: 18px;
          display: grid;
          gap: 16px;
          animation: panelIn 0.24s cubic-bezier(0.18, 0.86, 0.24, 1) both;
        }

        .dev-terminal {
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 16px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.03);
        }

        .dev-terminal-head {
          display: flex;
          gap: 8px;
          align-items: center;
          padding: 10px 12px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
        }

        .dev-dot {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          display: inline-block;
        }

        .dev-dot.red { background: #ff5f57; }
        .dev-dot.amber { background: #febc2e; }
        .dev-dot.green { background: #28c840; }

        .dev-terminal-body {
          font-family: "Consolas", "Courier New", monospace;
          color: rgba(255, 255, 255, 0.88);
          padding: 14px 12px;
          line-height: 1.5;
        }

        .dev-terminal-body p {
          margin: 0 0 6px;
        }

        .dev-terminal-body span {
          color: rgba(255, 255, 255, 0.64);
        }

        .dev-access {
          margin-top: 10px !important;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .dev-auth h3,
        .dev-editor-head h3,
        .dev-card h4 {
          margin: 0;
        }

        .dev-auth p {
          margin: 8px 0 10px;
          color: rgba(255, 255, 255, 0.72);
          font-size: 13px;
        }

        .dev-editor-head p {
          margin: 5px 0 0;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.62);
        }

        .dev-input {
          width: 100%;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          font: inherit;
          padding: 10px 12px;
          transition: border-color 0.22s ease, background 0.22s ease;
        }

        .dev-input:focus {
          border-color: rgba(255, 255, 255, 0.28);
          background: rgba(255, 255, 255, 0.07);
          outline: none;
        }

        .dev-input::placeholder {
          color: rgba(255, 255, 255, 0.45);
        }

        .dev-textarea {
          min-height: 72px;
          resize: vertical;
        }

        .dev-error {
          margin: 8px 0 0;
          color: #ff8f8f;
          font-size: 12px;
        }

        .dev-btn,
        .dev-mini-btn {
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.08);
          color: #fff;
          font: inherit;
          font-weight: 760;
          padding: 9px 12px;
          transition: transform 0.2s ease, border-color 0.2s ease, background 0.2s ease;
        }

        .dev-btn:hover,
        .dev-mini-btn:hover {
          transform: translateY(-1px);
          border-color: rgba(255, 255, 255, 0.24);
          background: rgba(255, 255, 255, 0.12);
        }

        .dev-btn.ghost {
          background: rgba(255, 255, 255, 0.04);
        }

        .dev-editor {
          display: grid;
          gap: 12px;
        }

        .dev-editor-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .dev-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .dev-card {
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          padding: 12px;
          display: grid;
          gap: 8px;
        }

        .dev-list {
          display: grid;
          gap: 6px;
          max-height: 220px;
          overflow: auto;
        }

        .dev-list-row {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          align-items: center;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
          padding: 8px;
        }

        .dev-list-row span {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.84);
        }

        .vouch-card::before,
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

        .panel-reviews {
          background: rgba(9, 9, 9, 0.97);
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

        .reviews-intro-block {
          position: relative;
          z-index: 1;
          margin: 10px auto 18px;
          max-width: 800px;
          border-radius: 20px;
          padding: 18px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          text-align: center;
        }

        .reviews-intro-block h3 {
          margin: 0 0 10px;
          font-size: clamp(18px, 3.2vw, 26px);
          line-height: 1.15;
          letter-spacing: 0.01em;
          text-transform: uppercase;
        }

        .reviews-intro-block p {
          margin: 8px 0 0;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.66);
          font-size: 14px;
        }

        .reviews-big-warning {
          margin: 0 0 10px !important;
          font-size: clamp(18px, 3.5vw, 28px) !important;
          line-height: 1.12 !important;
          font-weight: 920;
          letter-spacing: 0.01em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.96) !important;
        }

        .reviews-stat-row {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 14px;
        }

        .reviews-stat-card {
          border-radius: 16px;
          padding: 14px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          text-align: center;
        }

        .reviews-stat-card strong {
          display: block;
          font-size: clamp(20px, 4vw, 30px);
          line-height: 1;
          letter-spacing: -0.02em;
        }

        .reviews-stat-card span {
          display: block;
          margin-top: 7px;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.56);
        }

        .reviews-toolbar {
          position: relative;
          z-index: 1;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 14px;
        }

        .reviews-search {
          flex: 1 1 220px;
          min-height: 40px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
          color: #fff;
          font: inherit;
          padding: 0 12px;
          outline: none;
        }

        .reviews-search::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .reviews-search:focus {
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.06);
        }

        .reviews-filter {
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.82);
          border-radius: 999px;
          min-height: 40px;
          padding: 0 14px;
          font-size: 12px;
          font-weight: 760;
          letter-spacing: 0.03em;
          transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
        }

        .reviews-filter:hover {
          transform: translateY(-1px);
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.08);
        }

        .reviews-filter.is-active {
          border-color: rgba(255, 255, 255, 0.26);
          background: rgba(255, 255, 255, 0.14);
          color: #fff;
        }

        .reviews-grid-panel {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .review-panel-card {
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          padding: 14px;
          display: grid;
          gap: 12px;
        }

        .review-panel-quote {
          margin: 0;
          font-size: 14px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.92);
        }

        .review-panel-detail {
          margin: 0;
          font-size: 12px;
          line-height: 1.55;
          color: rgba(255, 255, 255, 0.56);
        }

        .review-panel-foot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .review-panel-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .review-panel-date {
          color: rgba(255, 255, 255, 0.46);
          font-size: 11px;
          letter-spacing: 0.07em;
          text-transform: uppercase;
        }

        .review-proof-chip {
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.78);
          font-size: 10px;
          font-weight: 760;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          padding: 6px 9px;
          white-space: nowrap;
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
        .vouch-card:hover {
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

        @keyframes splashEnter {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes eqBounce {
          0%,
          100% {
            transform: scaleY(0.45);
            opacity: 0.38;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        @keyframes pulseFade {
          0% {
            opacity: 0;
            transform: scale(0.92);
          }
          25% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: scale(1.04);
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
          .vouches-grid,
          .reviews-grid-panel {
            grid-template-columns: 1fr;
          }

          .contact-field-grid {
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

          .top-stack-inner {
            width: min(100%, calc(100% - 16px));
            display: block;
          }

          .top-center {
            width: 100%;
            gap: 8px;
          }

          .top-nav-row {
            grid-template-columns: 36px 1fr 36px;
            gap: 8px;
          }

          .music-icon-btn {
            width: 36px;
            height: 36px;
          }

          .wrap {
            width: min(100%, calc(100% - 16px));
            padding: 200px 0 100px;
          }

          .section-title {
            font-size: clamp(30px, 10vw, 46px);
          }

          .section-angle {
            font-size: clamp(26px, 8vw, 40px);
          }

          .contact-chip {
            font-size: 18px;
          }

          .contact-big strong {
            font-size: 28px;
          }

          .hero-title {
            font-size: clamp(34px, 13vw, 58px);
          }

          .hero-copy {
            font-size: 14px;
          }

          .opening-loader-card {
            min-width: min(100%, calc(100vw - 20px));
            border-radius: 18px;
            padding: 16px;
          }

          .opening-name {
            font-size: clamp(24px, 8vw, 40px);
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

          .reviews-stat-row {
            grid-template-columns: 1fr;
          }

          .reviews-toolbar {
            gap: 6px;
          }

          .reviews-search {
            flex-basis: 100%;
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
          .top-stack-inner {
            width: min(100%, calc(100% - 12px));
          }

          .top-center {
            width: 100%;
          }

          .wrap {
            padding: 194px 0 90px;
          }

          .dev-grid {
            grid-template-columns: 1fr;
          }

          .intro {
            font-size: 13px;
          }

          .hero-copy {
            max-width: 100%;
          }

          .vouch-quote,
          .vouch-detail {
            min-height: 0;
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

          .top-nav-row {
            grid-template-columns: 32px 1fr 32px;
            padding: 5px;
          }

          .music-icon-btn,
          .music-icon-slot {
            width: 32px;
            height: 32px;
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
          .vouch-card:hover {
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
