import React, { useState, Suspense, lazy } from "react";
import { setSearchStore, getSearchResults } from "@stores";

const About = lazy(() => import("./About"));

export default function DiscoveryHub() {
  const [showAbout, setShowAbout] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const handleStreamSubmit = (query: string) => {
    if (!query.trim()) return;
    setSearchStore("page", 1);
    setSearchStore("results", []);
    setSearchStore("query", query.trim());
    getSearchResults(true);
  };

  return (
    <div className="discovery-hub py-2 flex flex-col gap-4">
      {/* Direct Audio Stream Link Input */}
      <div className="hub-section p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/70">
        <div className="flex items-center gap-2 mb-2">
          <i className="ri-link-m text-neutral-400"></i>
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-300">
            Direct YouTube Stream or Playlist URL
          </span>
        </div>
        <p className="text-[11px] text-neutral-400 mb-3">
          Paste any YouTube, YouTube Music, or podcast link to instantly stream pure audio with no advertisements or bloat.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Paste https://youtube.com/watch?v=... or Video ID"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && customInput.trim()) {
                e.preventDefault();
                handleStreamSubmit(customInput);
              }
            }}
            className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600"
          />
          <button
            type="button"
            disabled={!customInput.trim()}
            onClick={() => handleStreamSubmit(customInput)}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:hover:bg-neutral-800 text-neutral-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Stream
          </button>
        </div>
      </div>

      {/* System Architecture & Ethics Toggle */}
      <div className="hub-section pt-2 border-t border-neutral-900">
        <button
          type="button"
          onClick={() => setShowAbout(!showAbout)}
          className="w-full py-2 flex items-center justify-between text-xs text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <i className="ri-shield-check-line"></i>
            ☆○NovaAC○☆ Audio Engine · Zero-Tracking & Architecture
          </span>
          <i className={`ri-arrow-down-s-line transition-transform ${showAbout ? "rotate-180" : ""}`}></i>
        </button>

        {showAbout && (
          <div className="mt-2 pt-2">
            <Suspense fallback={null}>
              <About />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}
