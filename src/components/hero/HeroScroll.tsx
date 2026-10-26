"use client";

/**
 * GSAP ScrollTrigger canvas scrub — desktop vs mobile frame sequences.
 * One-way frame progress (no reverse on scroll back).
 */
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 100;
const MOBILE_MQ = "(max-width: 768px)";

const frameSrc = (i: number, mobile: boolean) =>
  mobile
    ? `/frames-mobile/frame-${String(i).padStart(3, "0")}.webp?v=m1`
    : `/frames/frame-${String(i).padStart(3, "0")}.webp?v=dreamina2`;

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

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const images: (HTMLImageElement | undefined)[] = Array(FRAME_COUNT);
    const loaded = new Set<number>();
    let drawn = -1;
    let maxFrame = 0;
    let targetFrame = 0;
    let rafDraw = 0;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const srcFor = (i: number) => frameSrc(i, isMobile);

    const paint = (img: HTMLImageElement) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      // Desktop 16:9 → cover | Mobile 9:16 video → cover (fills phone)
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

    const flushDraw = () => {
      rafDraw = 0;
      const i = targetFrame;
      const img = images[i];
      if (!img || !loaded.has(i) || !img.complete || img.naturalWidth === 0) {
        return;
      }
      if (i === drawn) return;
      paint(img);
      drawn = i;
      poster?.classList.add("is-hidden");
      updateReadout(i);
    };

    const requestDraw = (index: number) => {
      targetFrame = Math.max(0, Math.min(FRAME_COUNT - 1, index));
      if (rafDraw) return;
      rafDraw = requestAnimationFrame(flushDraw);
    };

    const load = (i: number) => {
      if (i < 0 || i >= FRAME_COUNT || images[i]) return;
      const img = new Image();
      img.decoding = "async";
      img.src = srcFor(i);
      images[i] = img;
      const onReady = () => {
        loaded.add(i);
        if (i === targetFrame) requestDraw(i);
      };
      if (img.complete && img.naturalWidth > 0) onReady();
      else img.onload = onReady;
    };

    const clearImages = () => {
      for (let i = 0; i < FRAME_COUNT; i++) images[i] = undefined;
      loaded.clear();
      drawn = -1;
    };

    const preloadAhead = (center: number) => {
      load(center);
      for (let e = 1; e <= 28; e++) load(center + e);
      for (let e = 1; e <= 2; e++) load(center - e);
    };

    let next = 1;
    let inflight = 0;
    const MAX = 5;
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
          if (i === targetFrame) requestDraw(i);
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
      poster?.classList.remove("is-hidden");
      setPosterSrc(frameSrc(0, isMobile));
      load(0);
      requestDraw(0);
      preloadAhead(0);
      window.clearTimeout(queueTimer);
      queueTimer = window.setTimeout(pump, 80);
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
            scrub: true,
            onUpdate: (self) => {
              const raw = Math.floor(self.progress * (FRAME_COUNT - 1) + 1e-6);
              if (raw > maxFrame) maxFrame = raw;
              const f = maxFrame;
              preloadAhead(f);
              requestDraw(f);
              setChapter(f / (FRAME_COUNT - 1));
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
      if (rafDraw) cancelAnimationFrame(rafDraw);
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
