import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useThemeStore } from '../../store/useThemeStore';

export interface BackgroundMediaProps {
  variant: 'hero' | 'app';
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

interface Pulse {
  fromNode: number;
  toNode: number;
  progress: number;
  speed: number;
}

export const BackgroundMedia: React.FC<BackgroundMediaProps> = ({ variant }) => {
  const { theme, backgroundAnimation } = useThemeStore();
  const isLight = theme === 'light';

  // Capability & environment states
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobileOrSaveData, setIsMobileOrSaveData] = useState(false);
  const [hasVideoFiles, setHasVideoFiles] = useState<boolean | null>(null);
  const [videoCanPlay, setVideoCanPlay] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [isIntersecting, setIsIntersecting] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1. Detect motion preference & mobile / save-data
  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    const checkMobileAndData = () => {
      const isMobile = window.innerWidth < 768;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const connection = (navigator as any).connection;
      const isSaveData = connection?.saveData === true;
      setIsMobileOrSaveData(isMobile || isSaveData);
    };

    checkMobileAndData();
    window.addEventListener('resize', checkMobileAndData, { passive: true });

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('resize', checkMobileAndData);
    };
  }, []);

  // 2. Parallax scroll listener for "hero" variant (max 20px, disabled with reduced motion)
  useEffect(() => {
    if (variant !== 'hero' || prefersReducedMotion) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [variant, prefersReducedMotion]);

  // 3. Tab visibility listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // 4. IntersectionObserver to pause when offscreen
  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 5. Asset check (Option 1 Video vs Option 2 Canvas auto-detection)
  useEffect(() => {
    if (isLight || prefersReducedMotion || isMobileOrSaveData || !backgroundAnimation) {
      setHasVideoFiles(false);
      return;
    }

    let isMounted = true;

    const checkVideo = async () => {
      try {
        const webmCheck = await fetch('/media/aios-bg.webm', { method: 'HEAD' });
        if (!isMounted) return;
        if (webmCheck.ok) {
          setHasVideoFiles(true);
          return;
        }

        const mp4Check = await fetch('/media/aios-bg.mp4', { method: 'HEAD' });
        if (!isMounted) return;
        if (mp4Check.ok) {
          setHasVideoFiles(true);
          return;
        }

        // Neither video exists -> Pick OPTION 2
        setHasVideoFiles(false);
      } catch {
        if (isMounted) setHasVideoFiles(false);
      }
    };

    const timer = setTimeout(checkVideo, 50);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [isLight, prefersReducedMotion, isMobileOrSaveData, backgroundAnimation]);

  // 6. Video playback control
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasVideoFiles || videoError) return;

    const shouldPlay =
      isTabVisible &&
      isIntersecting &&
      backgroundAnimation &&
      !prefersReducedMotion &&
      !isLight;

    if (shouldPlay) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else {
      video.pause();
    }
  }, [isTabVisible, isIntersecting, backgroundAnimation, prefersReducedMotion, isLight, hasVideoFiles, videoError]);

  // 7. OPTION 2: Canvas Coded Background Animation
  // ~60 slowly drifting nodes with thin connecting lines (#23272D),
  // occasional ice-teal (#5EEAD4) pulses, capped at 30fps, devicePixelRatio <= 1.5
  useEffect(() => {
    const shouldUseCanvas =
      !isLight &&
      (hasVideoFiles === false || videoError || isMobileOrSaveData);

    const canvas = canvasRef.current;
    if (!shouldUseCanvas || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let width = 0;
    let height = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    // ~60 drifting nodes
    const nodeCount = Math.max(50, Math.min(70, Math.floor((width * height) / 22000)));
    const nodes: Node[] = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: 1.8 + Math.random() * 1.4,
        alpha: 0.4 + Math.random() * 0.5,
      });
    }

    const pulses: Pulse[] = [];
    const maxPulses = 8;
    let lastPulseSpawn = 0;

    // 30 FPS throttle
    const fpsInterval = 1000 / 30;
    let lastDrawTime = performance.now();

    const drawFrame = (now: number) => {
      const isAnimated =
        backgroundAnimation &&
        !prefersReducedMotion &&
        isTabVisible &&
        isIntersecting;

      if (isAnimated) {
        animFrameId = requestAnimationFrame(drawFrame);
      }

      const elapsed = now - lastDrawTime;
      if (isAnimated && elapsed < fpsInterval) {
        return;
      }
      lastDrawTime = now - (elapsed % fpsInterval);

      ctx.clearRect(0, 0, width, height);

      // Node movement with soft boundary bounce (zero jump)
      if (isAnimated) {
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          n.x += n.vx;
          n.y += n.vy;

          if (n.x < 15) {
            n.x = 15;
            n.vx = Math.abs(n.vx);
          } else if (n.x > width - 15) {
            n.x = width - 15;
            n.vx = -Math.abs(n.vx);
          }

          if (n.y < 15) {
            n.y = 15;
            n.vy = Math.abs(n.vy);
          } else if (n.y > height - 15) {
            n.y = height - 15;
            n.vy = -Math.abs(n.vy);
          }
        }
      }

      const connectionDistance = 160;
      const connectedPairs: [number, number, number][] = [];

      // Connecting lines: Graphite Border #23272D with subtle ice-teal ambient glow
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < connectionDistance) {
            connectedPairs.push([i, j, dist]);
            const distRatio = 1 - dist / connectionDistance;

            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            // Graphite line with faint Ice-Teal tint
            ctx.strokeStyle = `rgba(45, 60, 68, ${(distRatio * 0.75).toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Spawn Ice-Teal Pulses along active connections
      if (isAnimated && pulses.length < maxPulses && connectedPairs.length > 0 && now - lastPulseSpawn > 450) {
        const pair = connectedPairs[Math.floor(Math.random() * connectedPairs.length)];
        pulses.push({
          fromNode: pair[0],
          toNode: pair[1],
          progress: 0,
          speed: 0.02 + Math.random() * 0.025,
        });
        lastPulseSpawn = now;
      }

      // Draw pulses traveling along edges
      for (let p = pulses.length - 1; p >= 0; p--) {
        const pulse = pulses[p];
        if (isAnimated) {
          pulse.progress += pulse.speed;
        }

        if (pulse.progress >= 1) {
          pulses.splice(p, 1);
          continue;
        }

        const nodeA = nodes[pulse.fromNode];
        const nodeB = nodes[pulse.toNode];
        if (!nodeA || !nodeB) {
          pulses.splice(p, 1);
          continue;
        }

        const curX = nodeA.x + (nodeB.x - nodeA.x) * pulse.progress;
        const curY = nodeA.y + (nodeB.y - nodeA.y) * pulse.progress;

        // Tail position for trailing pulse streak
        const tailProgress = Math.max(0, pulse.progress - 0.18);
        const tailX = nodeA.x + (nodeB.x - nodeA.x) * tailProgress;
        const tailY = nodeA.y + (nodeB.y - nodeA.y) * tailProgress;

        const pulseAlpha = Math.sin(pulse.progress * Math.PI);

        // Glowing streak along edge
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(curX, curY);
        ctx.strokeStyle = `rgba(94, 234, 212, ${(pulseAlpha * 0.85).toFixed(2)})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Glowing pulse head
        ctx.beginPath();
        ctx.arc(curX, curY, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(94, 234, 212, ${(pulseAlpha * 0.95).toFixed(2)})`;
        ctx.shadowColor = '#5EEAD4';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      }

      // Draw nodes (Ice Teal + Graphite Core)
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        ctx.save();
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(94, 234, 212, ${n.alpha.toFixed(2)})`;
        ctx.shadowColor = '#5EEAD4';
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.restore();
      }
    };

    drawFrame(performance.now());

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [
    isLight,
    hasVideoFiles,
    videoError,
    isMobileOrSaveData,
    backgroundAnimation,
    prefersReducedMotion,
    isTabVisible,
    isIntersecting,
  ]);

  const handleVideoError = useCallback(() => {
    setVideoError(true);
  }, []);

  const handleVideoCanPlay = useCallback(() => {
    setVideoCanPlay(true);
  }, []);

  // ── LIGHT THEME: Subtle static texture (WCAG AA compliant) ──
  if (isLight) {
    return (
      <div
        ref={containerRef}
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0"
        style={{
          backgroundColor: '#FAFAF9',
          backgroundImage: 'radial-gradient(rgba(15, 23, 42, 0.05) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
    );
  }

  // ── GRAPHITE DARK THEME ──
  const isHero = variant === 'hero';

  // Opacity & filter settings
  // hero: opacity 0.55
  // app: opacity 0.12, blur(2px)
  const mediaOpacity = isHero ? 0.58 : 0.12;
  const mediaFilter = isHero ? 'none' : 'blur(2px)';

  const parallaxOffset = isHero && !prefersReducedMotion ? Math.min(scrollY * 0.04, 20) : 0;

  const renderVideo =
    hasVideoFiles === true &&
    !videoError &&
    !isMobileOrSaveData &&
    !prefersReducedMotion;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0"
      style={{ backgroundColor: '#0B0C0E' }}
    >
      {/* ── 1. Poster Layer (when reduced motion, animation disabled, or during initial video load) ── */}
      {(prefersReducedMotion || !backgroundAnimation || (renderVideo && !videoCanPlay)) && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 pointer-events-none"
          style={{
            backgroundImage: 'url(/media/aios-bg-poster.jpg)',
            opacity: mediaOpacity,
            filter: mediaFilter,
          }}
        />
      )}

      {/* ── 2. Option 1: Looping Video ── */}
      {renderVideo && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/media/aios-bg-poster.jpg"
          aria-hidden="true"
          onCanPlay={handleVideoCanPlay}
          onError={handleVideoError}
          className="fixed inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-[600ms] ease-out"
          style={{
            opacity: videoCanPlay ? mediaOpacity : 0,
            filter: mediaFilter,
            zIndex: -1,
          }}
        >
          <source src="/media/aios-bg.webm" type="video/webm" onError={handleVideoError} />
          <source src="/media/aios-bg.mp4" type="video/mp4" onError={handleVideoError} />
        </video>
      )}

      {/* ── 3. Option 2: Canvas Coded Background (when video is missing or mobile) ── */}
      {!renderVideo && backgroundAnimation && !prefersReducedMotion && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none"
          style={{
            opacity: mediaOpacity,
            filter: mediaFilter,
          }}
        />
      )}

      {/* ── 4. Scrim Overlays ── */}
      {isHero ? (
        /* HERO VARIANT SCRIM:
           Gradient scrim from var(--bg) at top and bottom (so it fades into page)
           plus a darker center so text stays readable, with optional subtle parallax on scroll.
        */
        <div
          className="absolute inset-0 pointer-events-none transition-transform duration-75 ease-out"
          style={{
            transform: `translateY(${parallaxOffset}px)`,
            background: `
              radial-gradient(circle at 50% 36%, rgba(11, 12, 14, 0.72) 0%, rgba(11, 12, 14, 0.22) 55%, rgba(11, 12, 14, 0.88) 100%),
              linear-gradient(to bottom, #0B0C0E 0%, transparent 16%, transparent 84%, #0B0C0E 100%)
            `,
          }}
        />
      ) : (
        /* APP VARIANT SCRIM:
           Solid scrim at 85% of var(--bg) (#0B0C0E) over it.
           All cards/tables/panels keep solid surface backgrounds.
        */
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: 'rgba(11, 12, 14, 0.85)',
          }}
        />
      )}
    </div>
  );
};
