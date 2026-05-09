"use client";

import { Layers, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MIN_VISIBLE_MS = 1300;
const EXIT_DURATION_MS = 720;

export default function AppPreloader() {
  const [phase, setPhase] = useState<"enter" | "exit" | "gone">("enter");
  const dismissStartedRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const mountTime = performance.now();

    const clearTimers = () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };

    const runDismissSequence = () => {
      if (dismissStartedRef.current) return;
      dismissStartedRef.current = true;

      const elapsed = performance.now() - mountTime;
      const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);

      const t1 = setTimeout(() => {
        setPhase("exit");
        document.body.classList.remove("app-preloader-active");
        const t2 = setTimeout(() => setPhase("gone"), EXIT_DURATION_MS);
        timersRef.current.push(t2);
      }, wait);
      timersRef.current.push(t1);
    };

    document.body.classList.add("app-preloader-active");

    if (document.readyState === "complete") {
      runDismissSequence();
    } else {
      window.addEventListener("load", runDismissSequence, { once: true });
    }

    return () => {
      window.removeEventListener("load", runDismissSequence);
      clearTimers();
      document.body.classList.remove("app-preloader-active");
    };
  }, []);

  if (phase === "gone") return null;

  const exiting = phase === "exit";

  return (
    <div
      className={`app-preloader-root ${exiting ? "app-preloader-root--exit" : ""}`}
      aria-hidden={exiting}
      aria-live="polite"
      aria-busy={!exiting}
    >
      <div className="app-preloader-aurora" />
      <div className="app-preloader-grid" />
      <div className="app-preloader-vignette" />

      <div className="app-preloader-orbit app-preloader-orbit--a" />
      <div className="app-preloader-orbit app-preloader-orbit--b" />

      <div className="app-preloader-content">
        <div className="app-preloader-badge">
          <Sparkles className="h-3.5 w-3.5 text-amber-300/90" aria-hidden />
          <span>IT Asset &amp; Subscription Management</span>
        </div>

        <div className="app-preloader-emblem">
          <div className="app-preloader-ring-outer">
            <div className="app-preloader-ring-inner">
              <Layers className="app-preloader-icon" strokeWidth={1.35} aria-hidden />
            </div>
          </div>
          <div className="app-preloader-glow" />
        </div>

        <div className="app-preloader-title-block">
          <h1 className="app-preloader-title">Portal</h1>
          <p className="app-preloader-sub">Secure workspace · Initializing session</p>
        </div>

        <div className="app-preloader-track">
          <div className="app-preloader-bar" />
        </div>
      </div>
    </div>
  );
}
