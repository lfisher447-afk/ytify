import React, { useState, Suspense, lazy } from "react";
import "./About.css";
import { t } from "@stores";

const EasyUsageGuide = lazy(() => import("./EasyUsageGuide"));

export default function About() {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="about p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-300 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-neutral-200 uppercase tracking-wider text-[11px]">
          ☆○NovaAC○☆ Audio Architecture
        </span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
          v8.5 Zero-Telemetry
        </span>
      </div>

      <p className="text-neutral-400 leading-relaxed">
        ☆○NovaAC○☆ is a local-first, zero-telemetry YouTube and YouTube Music audio player. All playback history, recommendations, and cached tracks remain strictly on-device in OPFS storage.
      </p>

      <button
        className="guideTrigger py-1.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer w-fit text-xs font-medium"
        type="button"
        aria-expanded={showGuide}
        onClick={() => setShowGuide(!showGuide)}
      >
        {t("about_learn_more")}
      </button>

      {showGuide && (
        <Suspense fallback={null}>
          <EasyUsageGuide />
        </Suspense>
      )}
    </div>
  );
}
