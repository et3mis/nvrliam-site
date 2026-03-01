"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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
type DiscordPresence = "online" | "idle" | "dnd" | "offline";

type ShowcaseItem = {
  title: string;
  embed: string;
  desc: string;
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
  size: number;
  opacity: number;
  delay: string;
  duration: string;
  dx: number;
  dy: number;
  lift: number;
  blur: number;
  scaleMin: number;
  scaleMax: number;
};

type CSSVars = CSSProperties & {
  "--dx"?: number | string;
  "--dy"?: number | string;
  "--lift"?: number | string;
  "--blur"?: string;
  "--scale-min"?: number | string;
  "--scale-max"?: number | string;
  "--opacity-base"?: number | string;
};

const DISCORD_USER_ID = "1404955716887904266";
const DISCORD_STATUS_ENABLED = /^\d{8,25}$/.test(DISCORD_USER_ID);
const DISCORD_POLL_MS = 30000;
const INITIAL_BOOT_MS = 900;
const BG_MUSIC_SRC = "/portfolio-music.mp3";
const BG_MUSIC_VOLUME = 0.18;

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
  { title: "Flying System", embed: "https://streamable.com/e/l7ugm?autoplay=0&loop=0", desc: "Smooth flight and boost." },
  { title: "TD Pathing", embed: "https://streamable.com/e/lqy3i9?autoplay=0&loop=0", desc: "Checkpoint pathing and overheads." },
  { title: "NPC Dialogue", embed: "https://streamable.com/e/edelsf?autoplay=0&loop=0", desc: "Monologue and dialogue setup." },
  { title: "Admin Panel", embed: "https://streamable.com/e/fnehz2?autoplay=0&loop=0", desc: "Admin UI and commands." },
];

const prices: PriceTier[] = [
  { title: "Quick Fixes", usd: "$5–$15", robux: "1.4k–4.3k R$", note: "Small fixes and tweaks.", icon: "fix" },
  { title: "Mini Scripts", usd: "$15–$35", robux: "4.3k–10k R$", note: "Small drop-in features.", icon: "mini" },
  { title: "Gameplay Features", usd: "$35–$80", robux: "10k–23k R$", note: "Mid-size systems.", icon: "play" },
  { title: "Full Systems", usd: "$80–$180", robux: "23k–51k R$", note: "Bigger polished systems.", icon: "full" },
  { title: "Full Game", usd: "$250+", robux: "71k+ R$", note: "Quote depends on scope.", icon: "game" },
];

function createParticleDots(count = 64): ParticleDot[] {
  return Array.from({ length: count }, (_, i) => {
    const left = 1 + ((i * 17) % 98);
    const top = 2 + ((i * 23) % 94);
    const size = 2 + (i % 5);
    const opacity = Math.min(0.2 + (i % 7) * 0.09, 0.9);
    const dx = Number((((i % 11) - 5) * (0.55 + (i % 3) * 0.18)).toFixed(2));
    const dy = Number((((((i + 4) % 11) - 5) || 1) * (0.5 + (i % 4) * 0.16)).toFixed(2));
    const lift = 2 + (i % 6);
    const blur = Math.max(0, (size - 2) * 0.4);

    return {
      left: `${left}%`,
      top: `${top}%`,
      size,
      opacity,
      delay: `${(i % 12) * 0.18}s`,
      duration: `${4.8 + (i % 9) * 0.7}s`,
      dx,
      dy,
      lift,
      blur,
      scaleMin: 0.72 + (i % 3) * 0.06,
      scaleMax: 1.06 + (i % 4) * 0.07,
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
  if (!("fonts" in document)) return Promise.resolve();
  return (document as Document & { fonts: FontFaceSet }).fonts.ready.then(() => undefined);
}

function preloadImage(src: string) {
  return new Promise<void>((resolve) => {
    const img = new Image();
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
  const [emailCopied, setEmailCopied] = useState(false);
  const [discordStatus, setDiscordStatus] = useState<DiscordPresence>(DISCORD_STATUS_ENABLED ? "offline" : "online");
  const [statusLoaded, setStatusLoaded] = useState(!DISCORD_STATUS_ENABLED);
  const [pageReady, setPageReady] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [musicUnlocked, setMusicUnlocked] = useState(false);
  const [avatarIndex, setAvatarIndex] = useState(0);

  const shellRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const copyTimerRef = useRef<number | null>(null);
  const fadeFrameRef = useRef<number | null>(null);

  const particleDots = useMemo(() => createParticleDots(), []);

  const filteredShowcases = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return showcases;
    return showcases.filter(
      (item) =>
        item.title.toLowerCase().includes(value) ||
        item.desc.toLowerCase().includes(value)
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
        sleep(INITIAL_BOOT_MS),
      ]);

      if (!active) return;

      window.requestAnimationFrame(() => {
        if (active) setPageReady(true);
      });
    };

    void boot();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const el = shellRef.current;
    if (!el) return;

    const state = {
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0,
      raf: 0,
    };

    const updateVars = () => {
      state.currentX += (state.targetX - state.currentX) * 0.08;
      state.currentY += (state.targetY - state.currentY) * 0.08;

      el.style.setProperty("--mx", state.currentX.toFixed(4));
      el.style.setProperty("--my", state.currentY.toFixed(4));
      el.style.setProperty("--pmx", (state.currentX * 14).toFixed(4));
      el.style.setProperty("--pmy", (state.currentY * 14).toFixed(4));

      state.raf = window.requestAnimationFrame(updateVars);
    };

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;

      state.targetX = (x - 0.5) * 2;
      state.targetY = (y - 0.5) * 2;
    };

    const onLeave = () => {
      state.targetX = 0;
      state.targetY = 0;
    };

    state.raf = window.requestAnimationFrame(updateVars);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
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

    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 80);

    return () => {
      window.clearTimeout(timer);
    };
  }, [panel]);

  useEffect(() => {
    if (panel === "none") return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPanel("none");
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [panel]);

  useEffect(() => {
    if (!DISCORD_STATUS_ENABLED) return;

    let cancelled = false;
    let timer = 0;
    let controller: AbortController | null = null;

    const poll = async () => {
      controller?.abort();

      const currentController = new AbortController();
      controller = currentController;

      try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`, {
          cache: "no-store",
          signal: currentController.signal,
        });

        if (!res.ok) throw new Error("Failed to fetch Discord status");

        const data = await res.json();
        const raw = String(data?.data?.discord_status ?? "offline").toLowerCase();

        const nextStatus: DiscordPresence =
          raw === "online" || raw === "idle" || raw === "dnd" ? raw : "offline";

        if (cancelled) return;

        setDiscordStatus(nextStatus);
        setStatusLoaded(true);
      } catch {
        if (cancelled || currentController.signal.aborted) return;

        setDiscordStatus("offline");
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

    return () => {
      cancelled = true;
      controller?.abort();
      window.clearTimeout(timer);
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
        if (!audio || disposed) return;

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

    const startMusic = async () => {
      if (!musicEnabled) return;

      clearPauseTimer();

      try {
        if (audio.paused) {
          await audio.play();
        }

        setMusicUnlocked(true);
        fadeVolume(audio.volume, BG_MUSIC_VOLUME, 550);
      } catch {
        setMusicUnlocked(false);
      }
    };

    const stopMusic = () => {
      clearPauseTimer();
      fadeVolume(audio.volume, 0, 320);

      pauseTimer = window.setTimeout(() => {
        if (!audio || disposed) return;
        audio.pause();
      }, 340);
    };

    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;

    if (musicEnabled) {
      void startMusic();
    } else {
      stopMusic();
    }

    const unlock = () => {
      if (!musicEnabled) return;
      void startMusic();
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
  }, [musicEnabled]);

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

  const copyEmail = async () => {
    const email = "liamj7872@gmail.com";
    let copied = false;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
        copied = true;
      } else {
        copied = fallbackCopy(email);
      }
    } catch {
      copied = fallbackCopy(email);
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
  };

  return (
    <main className={`page-shell ${pageReady ? "ready" : "booting"}`} ref={shellRef}>
      <audio ref={audioRef} src={BG_MUSIC_SRC} aria-hidden="true" />

      <div className="bg-aurora parallax" />
      <div className="bg-grid parallax" />
      <div className="bg-network parallax" />

      <div className="bg-sword-wrap parallax" aria-hidden="true">
        <div className="sword-glow" />
        <div className="sword">
          <span className="blade" />
          <span className="edge" />
          <span className="guard" />
          <span className="grip" />
          <span className="pommel" />
        </div>
      </div>

      <div className="bg-particles" aria-hidden="true">
        {particleDots.map((dot, index) => (
          <span
            key={`${dot.left}-${dot.top}-${index}`}
            className="particle dynamic-particle"
            style={
              {
                left: dot.left,
                top: dot.top,
                width: `${dot.size}px`,
                height: `${dot.size}px`,
                animationDelay: dot.delay,
                animationDuration: dot.duration,
                "--dx": dot.dx,
                "--dy": dot.dy,
                "--lift": dot.lift,
                "--blur": `${dot.blur}px`,
                "--scale-min": dot.scaleMin,
                "--scale-max": dot.scaleMax,
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
            <span className="page-loader-text">Loading</span>
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
              className={`tab-btn ${panel === "none" ? "active" : ""}`}
              onClick={() => setPanel("none")}
            >
              Home
            </button>
            <button
              type="button"
              className={`tab-btn ${panel === "showcase" ? "active" : ""}`}
              onClick={() => setPanel("showcase")}
            >
              Showcase
            </button>
            <button
              type="button"
              className={`tab-btn ${panel === "commission" ? "active" : ""}`}
              onClick={() => setPanel("commission")}
            >
              Commissions
            </button>
          </nav>

          <div className="top-profile">
            <img
              src={avatarSources[avatarIndex]}
              alt="Profile"
              className="avatar"
              loading="eager"
              decoding="async"
              fetchPriority="high"
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
          <p className="intro reveal delay-2">Liam • Roblox scripter</p>

          <h1 className="hero-title reveal delay-2">
            Stable Roblox systems.
            <span>Clean, simple, solid.</span>
          </h1>

          <p className="hero-copy reveal delay-3">
            I build full systems that are made to hold up in real games.
          </p>

          <div className="status-row reveal delay-3">
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
            <span>MAKE SURE TO JOIN DISCORD SERVER</span>
            <a href="https://discord.gg/62nWRxRs" target="_blank" rel="noreferrer" className="discord-callout-btn">
              Join Server
            </a>
          </div>

          <div className="stat-row reveal delay-3">
            <div className="stat-pill">
              <strong>2M+</strong>
              <span>community</span>
            </div>
            <div className="stat-pill">
              <strong>4B+</strong>
              <span>contributed</span>
            </div>
          </div>

          <div className="cta-row reveal delay-3">
            <button type="button" className="main-btn" onClick={() => setPanel("showcase")}>
              View Showcase
              <ArrowUpRight className="mini" />
            </button>
            <button type="button" className="ghost-btn" onClick={() => setPanel("commission")}>
              Pricing
            </button>
          </div>

          <div className="skills reveal delay-3">
            {skills.map((skill) => (
              <span key={skill.label} className="skill-pill">
                <span className={`skill-mark ${skill.tone}`}>{skill.mark}</span>
                {skill.label}
              </span>
            ))}
          </div>
        </section>
      </div>

      {panel !== "none" && (
        <div className="overlay" onClick={() => setPanel("none")}>
          <section
            className={`panel reveal ${panel === "showcase" ? "panel-showcase" : "panel-commission"}`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={panel === "showcase" ? "Showcase" : "Commission pricing"}
          >
            {panel === "showcase" ? (
              <>
                <div className="panel-head">
                  <h2>My Works</h2>
                  <button type="button" className="close-btn" onClick={() => setPanel("none")} aria-label="Close">
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
                      placeholder="Search..."
                      className="search-input"
                    />
                  </div>
                </div>

                <div className="video-grid">
                  {filteredShowcases.length > 0 ? (
                    filteredShowcases.map((item, index) => (
                      <article key={item.embed} className={`video-card reveal delay-${(index % 3) + 1}`}>
                        <div className="video-frame-wrap">
                          <iframe
                            title={item.title}
                            src={item.embed}
                            className="video-frame"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            loading={index < 2 ? "eager" : "lazy"}
                            referrerPolicy="strict-origin-when-cross-origin"
                          />
                        </div>
                        <h3>{item.title}</h3>
                        <p>{item.desc}</p>

                        <div className="video-actions">
                          <a
                            href={getVideoUrl(item.embed)}
                            target="_blank"
                            rel="noreferrer"
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
              </>
            ) : (
              <>
                <div className="panel-head">
                  <div>
                    <p className="eyebrow">Commission</p>
                    <h2>Pricing</h2>
                  </div>
                  <button type="button" className="close-btn" onClick={() => setPanel("none")} aria-label="Close">
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
                      <li>Rush is +10%</li>
                      <li>7 days of bug fixes after delivery</li>
                    </ul>
                  </div>

                  <div className="info-card">
                    <h3>Links</h3>
                    <ul>
                      <li>Email copies on click</li>
                      <li>Discord opens in app/web</li>
                      <li>Server invite is included</li>
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
                    <p>Tested for edge cases.</p>
                  </div>
                  <div className="policy-card">
                    <div className="policy-icon">
                      <Check className="mini" />
                    </div>
                    <h4>Fast</h4>
                    <p>Clear quotes and progress.</p>
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
                  <a href="https://discord.gg/62nWRxRs" target="_blank" rel="noreferrer" className="commission-ghost">
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
          background: radial-gradient(circle at 50% 0%, #080808 0%, #030303 35%, #000 100%);
          color: #fff;
          --mx: 0;
          --my: 0;
          --pmx: 0;
          --pmy: 0;
          perspective: 1400px;
        }

        .page-shell.booting .top-stack,
        .page-shell.booting .wrap {
          opacity: 0;
          pointer-events: none;
        }

        .page-shell.ready .top-stack,
        .page-shell.ready .wrap {
          opacity: 1;
          transition: opacity 0.35s ease;
        }

        .page-loader {
          position: fixed;
          inset: 0;
          z-index: 80;
          display: grid;
          place-items: center;
          background: rgba(0, 0, 0, 0.58);
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

        .parallax {
          transform: translate3d(calc(var(--mx) * 9px), calc(var(--my) * 7px), 0) scale(1.02);
          transform-origin: center;
          transition: transform 90ms linear;
          will-change: transform;
        }

        .bg-aurora,
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
            radial-gradient(circle at 22% 28%, rgba(255, 255, 255, 0.025), transparent 20%),
            radial-gradient(circle at 78% 24%, rgba(255, 255, 255, 0.02), transparent 18%);
          animation: auroraShift 10s ease-in-out infinite alternate;
        }

        .bg-grid {
          background-image: radial-gradient(circle, rgba(255, 255, 255, 0.14) 1px, transparent 1.2px);
          background-size: 24px 24px;
          opacity: 0.18;
        }

        .bg-network {
          background-image:
            linear-gradient(120deg, transparent 47%, rgba(255, 255, 255, 0.02) 48%, transparent 49%),
            linear-gradient(58deg, transparent 47%, rgba(255, 255, 255, 0.015) 48%, transparent 49%);
          background-size: 420px 420px, 380px 380px;
          opacity: 0.08;
          animation: networkShift 18s linear infinite;
        }

        .bg-sword-wrap {
          display: grid;
          place-items: center;
        }

        .sword-glow,
        .sword {
          position: absolute;
          left: 50%;
          top: 52%;
          transform: translate(-50%, -50%);
        }

        .sword-glow {
          width: 56px;
          height: 820px;
          border-radius: 999px;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.05),
            rgba(255, 255, 255, 0.22),
            rgba(255, 255, 255, 0.05)
          );
          filter: blur(58px);
          opacity: 0.8;
          animation: swordFloat 6.2s ease-in-out infinite;
        }

        .sword {
          width: 240px;
          height: 860px;
          opacity: 0.34;
          animation: swordFloat 6.2s ease-in-out infinite;
        }

        .blade,
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
          transform: translate3d(
              calc(var(--pmx) * var(--dx) * 1px),
              calc(var(--pmy) * var(--dy) * 1px),
              0
            )
            scale(var(--scale-min));
          animation-name: twinkleFloat;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          will-change: transform, opacity;
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
        }

        .top-center {
          pointer-events: auto;
          width: min(1120px, calc(100% - 24px));
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
        }

        .tab-btn {
          border: 0;
          font: inherit;
          border-radius: 999px;
          padding: 10px 16px;
          background: transparent;
          color: rgba(255, 255, 255, 0.68);
          font-weight: 750;
          transition: transform 0.22s ease, background 0.22s ease, color 0.22s ease;
        }

        .tab-btn:hover,
        .tab-btn.active {
          background: #fff;
          color: #000;
          transform: translateY(-1px);
        }

        .top-profile {
          display: grid;
          justify-items: center;
          gap: 8px;
        }

        .avatar {
          width: 56px;
          height: 56px;
          border-radius: 999px;
          object-fit: cover;
          border: 2px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45);
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
          font-weight: 750;
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
          max-width: 940px;
          text-align: center;
        }

        .intro {
          margin: 0;
          font-size: 14px;
          font-weight: 650;
          color: rgba(255, 255, 255, 0.82);
        }

        .hero-title {
          margin: 18px 0 0;
          font-size: clamp(38px, 6.6vw, 84px);
          line-height: 0.98;
          font-weight: 900;
          letter-spacing: -0.055em;
        }

        .hero-title span {
          display: block;
          margin-top: 8px;
          color: rgba(255, 255, 255, 0.58);
          font-family: Georgia, "Times New Roman", serif;
          font-style: italic;
          font-weight: 500;
        }

        .hero-copy {
          margin: 14px auto 0;
          max-width: 620px;
          font-size: 15px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.56);
        }

        .status-row,
        .stat-row,
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
          margin-top: 14px;
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
        }

        .stat-row {
          margin-top: 14px;
        }

        .cta-row {
          margin-top: 18px;
        }

        .skills {
          margin-top: 16px;
        }

        .status-pill,
        .stat-pill,
        .skill-pill {
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          padding: 10px 14px;
          transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease;
        }

        .status-pill {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.72);
        }

        .music-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font: inherit;
          cursor: pointer;
          color: #fff;
        }

        .music-pill.music-on {
          border-color: rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.08);
        }

        .music-pill.music-off {
          opacity: 0.7;
        }

        .stat-pill strong {
          display: block;
          font-size: 15px;
          line-height: 1;
          font-weight: 900;
        }

        .stat-pill span {
          display: block;
          margin-top: 5px;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: rgba(255, 255, 255, 0.45);
        }

        .skill-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          font-weight: 820;
          color: #f5f5f5;
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
          background: #3f3f46;
        }

        .skill-mark.js {
          background: #52525b;
        }

        .skill-mark.cpp {
          background: #71717a;
        }

        .skill-mark.cs {
          background: #3f3f46;
        }

        .skill-mark.py {
          background: #52525b;
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
          font-weight: 850;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          text-decoration: none;
          font: inherit;
          transition: transform 0.22s ease, background 0.22s ease, color 0.22s ease, border-color 0.22s ease;
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
        .skill-pill:hover {
          transform: translateY(-2px);
        }

        .overlay {
          position: fixed;
          inset: 0;
          z-index: 40;
          display: grid;
          place-items: center;
          padding: 24px;
          background: rgba(0, 0, 0, 0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .panel {
          width: min(1120px, 100%);
          max-height: min(84vh, 860px);
          overflow: auto;
          border-radius: 30px;
          padding: 24px;
        }

        .panel-showcase {
          background: rgba(6, 6, 6, 0.96);
        }

        .panel-commission {
          background: rgba(8, 8, 8, 0.96);
        }

        .panel-head {
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .panel-head h2 {
          margin: 0;
          font-size: clamp(28px, 5vw, 48px);
          line-height: 1;
          font-weight: 900;
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
          color: rgba(255, 255, 255, 0.8);
          transition: transform 0.22s ease, background 0.22s ease;
        }

        .close-btn:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.1);
        }

        .toolbar-row {
          margin-bottom: 18px;
          justify-content: flex-start;
        }

        .search-shell {
          min-width: min(340px, 100%);
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
        }

        .video-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .video-card,
        .tier-card,
        .info-card,
        .policy-card,
        .empty-card {
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          padding: 16px;
          transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease;
        }

        .video-card:hover,
        .tier-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.05);
        }

        .video-frame-wrap {
          overflow: hidden;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: #050505;
        }

        .video-frame {
          display: block;
          width: 100%;
          height: 220px;
          border: 0;
          background: #050505;
        }

        .video-card h3,
        .tier-card h3,
        .info-card h3,
        .policy-card h4,
        .empty-card h3 {
          margin: 14px 0 0;
          font-size: 18px;
          font-weight: 900;
        }

        .video-card p,
        .tier-card p,
        .info-card li,
        .policy-card p,
        .empty-card p {
          margin: 8px 0 0;
          line-height: 1.65;
          color: rgba(255, 255, 255, 0.58);
        }

        .video-actions {
          margin-top: 12px;
          display: flex;
          justify-content: flex-start;
        }

        .empty-card {
          grid-column: 1 / -1;
          text-align: center;
          padding: 28px 18px;
        }

        .pricing-list {
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
          color: rgba(255, 255, 255, 0.85);
          font-weight: 850;
          font-size: 14px;
        }

        .tier-meta {
          margin-top: 8px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.45);
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }

        .commission-grid,
        .policy-grid {
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
        }

        .contact-actions {
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
          animation-delay: 0.12s;
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

        @keyframes auroraShift {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          100% {
            transform: translate3d(-2%, 1%, 0) scale(1.03);
          }
        }

        @keyframes networkShift {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-56px, 34px, 0);
          }
        }

        @keyframes swordFloat {
          0%,
          100% {
            transform: translate(-50%, -50%) rotate(-9deg);
          }
          50% {
            transform: translate(-50%, -54%) rotate(-5deg);
          }
        }

        @keyframes twinkleFloat {
          0%,
          100% {
            opacity: calc(var(--opacity-base) * 0.5);
            transform: translate3d(
                calc(var(--pmx) * var(--dx) * 1px),
                calc(var(--pmy) * var(--dy) * 1px),
                0
              )
              scale(var(--scale-min));
            box-shadow:
              0 0 10px rgba(255, 255, 255, 0.2),
              0 0 18px rgba(255, 255, 255, 0.06);
          }
          50% {
            opacity: var(--opacity-base);
            transform: translate3d(
                calc(var(--pmx) * var(--dx) * 1px),
                calc(var(--pmy) * var(--dy) * 1px),
                0
              )
              translateY(calc(var(--lift) * -1px))
              scale(var(--scale-max));
            box-shadow:
              0 0 16px rgba(255, 255, 255, 0.34),
              0 0 26px rgba(255, 255, 255, 0.1);
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
          .policy-grid {
            grid-template-columns: 1fr;
          }

          .video-frame {
            height: 240px;
          }
        }

        @media (max-width: 700px) {
          .wrap {
            width: min(100%, calc(100% - 16px));
            padding: 196px 0 120px;
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
          }

          .tab-btn {
            padding: 9px 13px;
            font-size: 13px;
          }

          .avatar {
            width: 52px;
            height: 52px;
          }

          .panel {
            padding: 18px;
            border-radius: 24px;
          }

          .search-shell {
            min-width: 100%;
          }

          .discord-callout {
            width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }

          .parallax,
          .dynamic-particle {
            transform: none !important;
          }
        }
      `}</style>
    </main>
  );
}
