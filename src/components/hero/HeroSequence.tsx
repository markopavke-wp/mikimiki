"use client";

/**
 * Faithful port of NOLITH freight-intelligence hero interaction:
 * sticky canvas sequence, Lenis scroll progress, chapter rail, frame readout.
 * Frames: /frames/frame-000.webp … frame-099.webp (displayed as Frame 001–100).
 */
import { useEffect, useRef } from "react";

const FRAME_COUNT = 100;
const CHAPTER_AT = [0, 0.27, 0.45, 0.62, 0.82] as const;

// v=6 Tripo van → tunnel hologram → logo
const frameSrc = (index: number) =>
  `/frames/frame-${String(index).padStart(3, "0")}.webp?v=6`;

const COPY_CLASSES = [
  "is-visible",
  "is-entering-forward",
  "is-entering-backward",
  "is-exiting-forward",
  "is-exiting-backward",
] as const;

export function HeroSequence() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const copiesRef = useRef<(HTMLDivElement | null)[]>([]);
  const railsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    const canvas = canvasRef.current;
    const poster = posterRef.current;
    const readout = readoutRef.current;
    if (!section || !sticky || !canvas) return;

    const copies = copiesRef.current.filter(Boolean) as HTMLDivElement[];
    const rails = railsRef.current.filter(Boolean) as HTMLButtonElement[];
    const reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const images: (HTMLImageElement | undefined)[] = Array(FRAME_COUNT);
    const loaded = new Set<number>();

    let frameIndex = 0;
    let drawnIndex = -1;
    let rafDraw = 0;
    let rafScroll = 0;
    let chapterIndex = -1;
    let chapterGen = 0;
    let exitTimer = 0;

    const load = (i: number) => {
      if (i < 0 || i >= FRAME_COUNT || images[i]) return;
      const img = new Image();
      img.decoding = "async";
      img.src = frameSrc(i);
      img.onload = () => {
        loaded.add(i);
        if (i === frameIndex || drawnIndex < 0) scheduleDraw();
      };
      img.onerror = () => {
        images[i] = undefined;
      };
      images[i] = img;
    };

    const preloadAround = (center: number) => {
      for (let e = 0; e <= 10; e++) {
        load(center + e);
        load(center - e);
      }
    };

    const nearestLoaded = (i: number) => {
      if (loaded.has(i)) return i;
      for (let e = 1; e < FRAME_COUNT; e++) {
        if (loaded.has(i - e)) return i - e;
        if (loaded.has(i + e)) return i + e;
      }
      return -1;
    };

    const paint = (img: HTMLImageElement) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    };

    const flushDraw = () => {
      rafDraw = 0;
      const idx = nearestLoaded(frameIndex);
      const img = idx >= 0 ? images[idx] : undefined;
      if (img?.complete && img.naturalWidth) {
        paint(img);
        drawnIndex = idx;
        poster?.classList.add("is-hidden");
      }
    };

    const scheduleDraw = () => {
      if (!rafDraw) rafDraw = requestAnimationFrame(flushDraw);
    };

    const progress = () => {
      const rect = section.getBoundingClientRect();
      const range = section.offsetHeight - sticky.offsetHeight;
      return Math.max(0, Math.min(1, -rect.top / Math.max(1, range)));
    };

    const chapterFromProgress = (p: number) => {
      for (let i = CHAPTER_AT.length - 1; i >= 0; i--) {
        if (p >= CHAPTER_AT[i]) return i;
      }
      return 0;
    };

    const clearCopyClasses = (el: HTMLElement) => {
      el.classList.remove(...COPY_CLASSES);
    };

    const setChapter = (next: number, instant = false) => {
      if (!copies[next]) return;
      const prev = chapterIndex;
      const dir = prev < 0 || next >= prev ? "forward" : "backward";
      const visible = copies.find((c) => c.classList.contains("is-visible"));
      const target = copies[next];
      const gen = ++chapterGen;
      window.clearTimeout(exitTimer);

      copies.forEach((c) => {
        if (c !== visible) clearCopyClasses(c);
      });

      if (visible && visible !== target) {
        visible.classList.remove("is-visible");
        visible.classList.add(`is-exiting-${dir}`);
      }

      clearCopyClasses(target);
      target.classList.add(`is-entering-${dir}`);
      chapterIndex = next;
      sticky.setAttribute("data-chapter-direction", dir);

      copies.forEach((c, i) => {
        c.setAttribute("aria-hidden", i === chapterIndex ? "false" : "true");
      });
      rails.forEach((btn, i) => {
        if (i === chapterIndex) btn.setAttribute("aria-current", "true");
        else btn.removeAttribute("aria-current");
      });

      const finish = () => {
        if (gen !== chapterGen) return;
        copies.forEach((c) => {
          if (c !== target) clearCopyClasses(c);
        });
        clearCopyClasses(target);
        target.classList.add("is-visible");
      };

      if (instant || !visible) finish();
      else exitTimer = window.setTimeout(finish, 220);
    };

    const onFrame = () => {
      if (reducedMq.matches) return;
      const p = progress();
      frameIndex = Math.round(p * (FRAME_COUNT - 1));
      preloadAround(frameIndex);
      scheduleDraw();
      const ch = chapterFromProgress(p);
      const current = copies[chapterIndex];
      const showing =
        current?.classList.contains("is-visible") ||
        current?.classList.contains("is-entering-forward") ||
        current?.classList.contains("is-entering-backward");
      if (ch !== chapterIndex || !showing) setChapter(ch, chapterIndex < 0);
      if (readout) {
        readout.textContent = `Frame ${String(frameIndex + 1).padStart(3, "0")}`;
      }
    };

    const onScroll = () => {
      if (!rafScroll) {
        rafScroll = requestAnimationFrame(() => {
          rafScroll = 0;
          onFrame();
        });
      }
    };

    const applyReduced = (on: boolean) => {
      document.documentElement.classList.toggle("reduced-motion", on);
      chapterGen += 1;
      window.clearTimeout(exitTimer);
      if (on) {
        frameIndex = 88;
        load(frameIndex);
        chapterIndex = -1;
        copies.forEach((c) => {
          clearCopyClasses(c);
          c.setAttribute("aria-hidden", "true");
        });
        scheduleDraw();
      } else {
        chapterIndex = -1;
        onFrame();
      }
    };

    const onRailClick = (btn: HTMLButtonElement) => {
      const p = Number(btn.dataset.progress ?? 0);
      const y =
        section.offsetTop + p * (section.offsetHeight - sticky.offsetHeight);
      const lenis = (window as unknown as { __lenis?: { scrollTo: (v: number) => void } })
        .__lenis;
      if (lenis) lenis.scrollTo(y);
      else window.scrollTo({ top: y, behavior: "auto" });
    };

    const railHandlers = rails.map((btn) => {
      const handler = () => onRailClick(btn);
      btn.addEventListener("click", handler);
      return () => btn.removeEventListener("click", handler);
    });

    load(0);
    preloadAround(0);
    const idle =
      window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 80));
    idle(() => {
      for (let i = 0; i < FRAME_COUNT; i += 4) load(i);
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", scheduleDraw);
    const onReducedChange = (e: MediaQueryListEvent) => applyReduced(e.matches);
    reducedMq.addEventListener("change", onReducedChange);
    applyReduced(reducedMq.matches);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", scheduleDraw);
      reducedMq.removeEventListener("change", onReducedChange);
      railHandlers.forEach((off) => off());
      cancelAnimationFrame(rafDraw);
      cancelAnimationFrame(rafScroll);
      window.clearTimeout(exitTimer);
      document.documentElement.classList.remove("reduced-motion");
    };
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        id="pocetna"
        className="sequence-scroll"
        aria-labelledby="sequence-title"
      >
        <div ref={stickyRef} className="sequence-sticky">
          <canvas
            ref={canvasRef}
            className="sequence-canvas"
            width={2560}
            height={1440}
            aria-hidden
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={posterRef}
            className="sequence-poster"
            src="/frames/frame-000.webp?v=6"
            alt=""
          />
          <div className="sequence-shade" aria-hidden />

          <div className="sequence-topline">
            <span>System 01 / Travel cognition</span>
            <span ref={readoutRef} className="frame-readout">
              Frame 001
            </span>
          </div>

          <div
            className="chapter-copy"
            data-active="0"
            ref={(el) => {
              copiesRef.current[0] = el;
            }}
          >
            <p className="chapter-kicker">01 / Put</p>
            <h1 id="sequence-title">
              Kombi kreće.
              <br />
              Tunel čeka.
            </h1>
            <p className="chapter-body">
              Miki &amp; Miki TRAVEL kreće u pokret — putanja, infrastruktura i pravac
              u jednoj živoj slici.
            </p>
          </div>
          <div
            className="chapter-copy"
            data-active="1"
            ref={(el) => {
              copiesRef.current[1] = el;
            }}
          >
            <p className="chapter-kicker">02 / Ulaz</p>
            <h2>Ulazak u tunel menja perspektivu.</h2>
            <p className="chapter-body">
              Pokret, oblik i kontekst postaju signal — sve što treba da vidiš pre nego
              što stigneš.
            </p>
          </div>
          <div
            className="chapter-copy"
            data-active="2"
            ref={(el) => {
              copiesRef.current[2] = el;
            }}
          >
            <p className="chapter-kicker">03 / Hologram</p>
            <h2>Tekstura postaje struktura.</h2>
            <p className="chapter-body">
              Kombi se rastvara u hologramski model — živ, čitljiv, spreman za
              odluku.
            </p>
          </div>
          <div
            className="chapter-copy"
            data-active="3"
            ref={(el) => {
              copiesRef.current[3] = el;
            }}
          >
            <p className="chapter-kicker">04 / Transform</p>
            <h2>Struktura se skuplja u znak.</h2>
            <p className="chapter-body">
              Hologram se sabija — od vozila do simbola koji nosi putovanje.
            </p>
          </div>
          <div
            className="chapter-copy"
            data-active="4"
            ref={(el) => {
              copiesRef.current[4] = el;
            }}
          >
            <p className="chapter-kicker">05 / Brend</p>
            <h2>Sve se sabira u Miki &amp; Miki.</h2>
            <p className="chapter-body">
              Od puta do znaka — brend koji vozi, vodi i ostaje jasan.
            </p>
          </div>

          <nav className="chapter-rail" aria-label="Sequence chapters">
            {(
              [
                ["0", "01", "Put"],
                [".27", "02", "Ulaz"],
                [".45", "03", "Hologram"],
                [".62", "04", "Transform"],
                [".82", "05", "Brend"],
              ] as const
            ).map(([progress, num, label], i) => (
              <button
                key={label}
                type="button"
                data-progress={progress}
                aria-current={i === 0 ? "true" : undefined}
                ref={(el) => {
                  railsRef.current[i] = el;
                }}
              >
                <span>{num}</span> {label}
              </button>
            ))}
          </nav>

          <div className="scroll-cue" aria-hidden>
            <span /> Scroll to resolve
          </div>
        </div>

        <div className="accessible-chapters">
          <article>
            <span>01</span>
            <h2>Observe</h2>
            <p>Read physical movement before it becomes operational noise.</p>
          </article>
          <article>
            <span>02</span>
            <h2>Translate</h2>
            <p>Convert motion, shape and context into one shared language.</p>
          </article>
          <article>
            <span>03</span>
            <h2>Model</h2>
            <p>Keep vehicles, infrastructure and routes in one living twin.</p>
          </article>
          <article>
            <span>04</span>
            <h2>Route</h2>
            <p>Expose the clearest path through changing conditions.</p>
          </article>
          <article>
            <span>05</span>
            <h2>Decide</h2>
            <p>Turn moving signals into one executable decision.</p>
          </article>
        </div>
      </section>
    </>
  );
}
