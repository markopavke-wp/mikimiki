"use client";

/**
 * GSAP ScrollTrigger canvas scrub — desktop vs mobile sequences.
 * Progress is one-way; once the last frame is reached it stays locked.
 */
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 100;
const MOBILE_MQ = "(max-width: 768px)";

const frameSrc = (i: number, mobile: boolean) =>
  mobile
    ? `/frames-mobile/frame-${String(i).padStart(3, "0")}.webp?v=m2`
    : `/frames/frame-${String(i).padStart(3, "0")}.webp?v=dreamina3`;

const CHAPTERS = [
  {
    kicker: "01 / Polazak",
    title: "Kombi kreće.",
    body: "Miki & Miki TRAVEL — putovanja i prevoz iz Niša, od prvog metra.",
  },
  {
    kicker: "02 / Put",
    title: "Brzina i pravac.",
    body: "Asfalt, svetlo, destinacija. Svaki kilometar vodi ka moru ili planini.",
  },
  {
    kicker: "03 / Brend",
    title: "Znak na putu.",
    body: "Ime koje vozi sa tobom — Miki & Miki TRAVEL.",
  },
  {
    kicker: "04 / Destinacija",
    title: "Stigli ste.",
    body: "Obala, put, mir. Tu gde priča počinje.",
  },
] as const;

export function HeroScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [posterSrc, setPosterSrc] = useState(() => frameSrc(0, false));

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    const poster = posterRef.current;
    if (!section || !canvas) return;

    const mq = window.matchMedia(MOBILE_MQ);
    let isMobile = mq.matches;
    setPosterSrc(frameSrc(0, isMobile));
    section.classList.toggle("is-mobile-hero", isMobile);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const images: (HTMLImageElement | undefined)[] = Array(FRAME_COUNT);
    const loaded = new Set<number>();
    let drawn = -1;
    let maxFrame = 0;
    let displayFrame = 0; // smoothed toward target
    let targetFrame = 0;
    let rafSmooth = 0;
    let sequenceLocked = false; // after full hero once — forever last frame
    const LAST = FRAME_COUNT - 1;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const srcFor = (i: number) => frameSrc(i, isMobile);

    const paint = (img: HTMLImageElement) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      const dx = (w - dw) / 2;
      const dy = (h - dh) / 2;
      ctx.fillStyle = "#0a0c0e";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, dx, dy, dw, dh);
    };

    const updateReadout = (i: number) => {
      if (readoutRef.current) {
        readoutRef.current.textContent = `Frame ${String(i + 1).padStart(3, "0")}`;
      }
    };

    const paintIndex = (i: number) => {
      const img = images[i];
      if (!img || !loaded.has(i) || !img.complete || img.naturalWidth === 0) {
        return false;
      }
      if (i === drawn) return true;
      paint(img);
      drawn = i;
      poster?.classList.add("is-hidden");
      updateReadout(i);
      return true;
    };

    /** Prefer exact frame; else nearest already-loaded toward travel direction. */
    const paintBest = (want: number, preferForward: boolean) => {
      if (paintIndex(want)) return;
      for (let e = 1; e <= 8; e++) {
        const a = preferForward ? want + e : want - e;
        const b = preferForward ? want - e : want + e;
        if (a >= 0 && a < FRAME_COUNT && paintIndex(a)) return;
        if (b >= 0 && b < FRAME_COUNT && paintIndex(b)) return;
      }
    };

    const tickSmooth = () => {
      rafSmooth = 0;
      const diff = targetFrame - displayFrame;
      if (Math.abs(diff) < 0.35) {
        displayFrame = targetFrame;
      } else {
        // Catch up faster on mobile so one flick covers many frames smoothly
        const ease = isMobile ? 0.42 : 0.28;
        displayFrame += diff * ease;
      }
      const idx = Math.round(displayFrame);
      const prev = drawn;
      paintBest(idx, targetFrame >= displayFrame);
      preloadAhead(idx);
      if (Math.abs(targetFrame - displayFrame) >= 0.35 || drawn !== prev) {
        rafSmooth = requestAnimationFrame(tickSmooth);
      }
    };

    const forceLastFrame = () => {
      sequenceLocked = true;
      maxFrame = LAST;
      targetFrame = LAST;
      displayFrame = LAST;
      if (rafSmooth) {
        cancelAnimationFrame(rafSmooth);
        rafSmooth = 0;
      }
      if (!paintIndex(LAST)) {
        load(LAST);
        // hold whatever is drawn until last is ready, then snap
        const img = images[LAST];
        if (img) {
          img.onload = () => {
            loaded.add(LAST);
            paintIndex(LAST);
          };
        }
      }
      setChapter(1);
    };

    const requestTarget = (index: number) => {
      if (sequenceLocked) {
        forceLastFrame();
        return;
      }
      const next = Math.max(0, Math.min(LAST, index));
      targetFrame = next;
      if (!rafSmooth) rafSmooth = requestAnimationFrame(tickSmooth);
    };

    const load = (i: number) => {
      if (i < 0 || i >= FRAME_COUNT || images[i]) return;
      const img = new Image();
      img.decoding = "async";
      img.src = srcFor(i);
      images[i] = img;
      const onReady = () => {
        loaded.add(i);
        if (Math.abs(i - Math.round(displayFrame)) <= 1) {
          requestTarget(targetFrame);
        }
      };
      if (img.complete && img.naturalWidth > 0) onReady();
      else img.onload = onReady;
    };

    const clearImages = () => {
      for (let i = 0; i < FRAME_COUNT; i++) images[i] = undefined;
      loaded.clear();
      drawn = -1;
      displayFrame = 0;
    };

    const preloadAhead = (center: number) => {
      load(center);
      const ahead = isMobile ? 36 : 24;
      for (let e = 1; e <= ahead; e++) load(center + e);
      for (let e = 1; e <= (isMobile ? 12 : 3); e++) load(center - e);
    };

    let next = 1;
    let inflight = 0;
    const MAX = isMobile ? 8 : 5;
    let queueTimer = 0;

    const pump = () => {
      while (inflight < MAX && next < FRAME_COUNT) {
        const i = next++;
        if (images[i]) continue;
        inflight++;
        const img = new Image();
        img.decoding = "async";
        img.src = srcFor(i);
        images[i] = img;
        const done = () => {
          loaded.add(i);
          inflight--;
          if (Math.abs(i - Math.round(displayFrame)) <= 2) {
            requestTarget(targetFrame);
          }
          pump();
        };
        if (img.complete && img.naturalWidth > 0) done();
        else {
          img.onload = done;
          img.onerror = () => {
            inflight--;
            pump();
          };
        }
      }
    };

    const startSequence = () => {
      clearImages();
      next = 1;
      inflight = 0;
      maxFrame = 0;
      targetFrame = 0;
      displayFrame = 0;
      // Keep lock across mobile/desktop switch if already finished
      poster?.classList.remove("is-hidden");
      setPosterSrc(frameSrc(0, isMobile));
      section.classList.toggle("is-mobile-hero", isMobile);
      if (sequenceLocked) {
        load(LAST);
        forceLastFrame();
        preloadAhead(LAST);
        window.clearTimeout(queueTimer);
        queueTimer = window.setTimeout(pump, 40);
        return;
      }
      load(0);
      requestTarget(0);
      preloadAhead(0);
      window.clearTimeout(queueTimer);
      queueTimer = window.setTimeout(pump, 40);
    };

    startSequence();

    let activeChapter = -1;
    const setChapter = (progress: number) => {
      const idx = Math.min(
        CHAPTERS.length - 1,
        Math.floor(progress * CHAPTERS.length),
      );
      if (idx === activeChapter) return;
      activeChapter = idx;
      chapterRefs.current.forEach((el, i) => {
        el?.classList.toggle("is-active", i === idx);
      });
    };

    const triggers: ScrollTrigger[] = [];

    if (!reduced) {
      const tween = gsap.to(
        {},
        {
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "bottom bottom",
            scrub: isMobile ? 0.55 : 0.35,
            onUpdate: (self) => {
              if (sequenceLocked) {
                forceLastFrame();
                return;
              }
              // Peak progress only — never rewind frames mid-scrub
              const peak = Math.max(
                self.progress,
                maxFrame / LAST,
              );
              const raw = Math.round(peak * LAST);
              if (raw > maxFrame) maxFrame = raw;

              // Finished the sequence (or nearly) → hard lock
              if (self.progress >= 0.98 || maxFrame >= LAST) {
                forceLastFrame();
                return;
              }

              preloadAhead(maxFrame);
              requestTarget(maxFrame);
              setChapter(maxFrame / LAST);
            },
            onLeave: () => {
              // Scrolled past hero bottom → lock forever
              forceLastFrame();
            },
            onEnterBack: () => {
              // Coming back from below → still locked on last frame
              if (sequenceLocked) forceLastFrame();
            },
            onLeaveBack: () => {
              // Left hero upward — keep lock if already completed
              if (sequenceLocked) forceLastFrame();
            },
          },
        },
      );
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    }
    setChapter(0);

    const onResize = () => {
      const nowMobile = mq.matches;
      if (nowMobile !== isMobile) {
        isMobile = nowMobile;
        startSequence();
        ScrollTrigger.refresh();
        return;
      }
      if (drawn >= 0 && images[drawn]?.complete) paint(images[drawn]!);
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);
    mq.addEventListener("change", onResize);

    const lenis = window.__lenis;
    const onLenis = () => ScrollTrigger.update();
    lenis?.on("scroll", onLenis);

    return () => {
      window.clearTimeout(queueTimer);
      window.removeEventListener("resize", onResize);
      mq.removeEventListener("change", onResize);
      lenis?.off("scroll", onLenis);
      if (rafSmooth) cancelAnimationFrame(rafSmooth);
      triggers.forEach((t) => t.kill());
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === section) t.kill();
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="pocetna"
      className="hero-scroll"
      aria-labelledby="hero-scroll-title"
    >
      <div className="hero-scroll-sticky">
        <canvas ref={canvasRef} className="hero-scroll-canvas" aria-hidden />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={posterRef}
          className="hero-scroll-poster"
          src={posterSrc}
          alt=""
          fetchPriority="high"
        />
        <div className="hero-scroll-shade" aria-hidden />

        <div className="hero-scroll-topline">
          <span>Miki &amp; Miki TRAVEL</span>
          <span ref={readoutRef} className="hero-scroll-readout">
            Frame 001
          </span>
        </div>

        {CHAPTERS.map((ch, i) => (
          <div
            key={ch.kicker}
            className={`hero-scroll-copy${i === 0 ? " is-active" : ""}`}
            ref={(el) => {
              chapterRefs.current[i] = el;
            }}
          >
            <p className="hero-scroll-kicker">{ch.kicker}</p>
            <h2
              id={i === 0 ? "hero-scroll-title" : undefined}
              className="hero-scroll-heading"
            >
              {ch.title}
            </h2>
            <p className="hero-scroll-body">{ch.body}</p>
          </div>
        ))}

        <p className="hero-scroll-cue" aria-hidden>
          Skroluj
        </p>
      </div>
    </section>
  );
}
