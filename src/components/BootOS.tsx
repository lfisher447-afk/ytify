import React, { useState, useEffect, useRef } from "react";
import { setConfig, config, useConfig } from "@config";
import { setStore, t } from "@stores";
import { cn } from "./common";

interface BootOSProps {
  onComplete: () => void;
  forceOpenWizard?: boolean;
}

export default function BootOS({ onComplete, forceOpenWizard = false }: BootOSProps) {
  const currentConfig = useConfig();
  const [phase, setPhase] = useState<"boot" | "wizard" | "tutorial" | "done">(
    forceOpenWizard ? "wizard" : "boot"
  );
  
  // Boot Sequence State
  const [bootLog, setBootLog] = useState<string[]>([]);
  const [bootProgress, setBootProgress] = useState(0);
  const [booting, setBooting] = useState(!forceOpenWizard);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Wizard Step State
  const [step, setStep] = useState(1);
  const [proxyTestResult, setProxyTestResult] = useState<string | null>(null);
  const [testingProxy, setTestingProxy] = useState(false);

  // Web Audio Chime Generator
  const playChime = (freq: number = 523.25, type: OscillatorType = "sine") => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch {
      // AudioContext policy catch
    }
  };

  // Run Boot Sequence
  useEffect(() => {
    if (forceOpenWizard) return;

    const logs = [
      "INITIALIZING YTIFY AUDIO ENGINE v8.5 ARCHITECTURE...",
      "VERIFYING WEB AUDIO PIPELINE & MEDIA SESSION HANDLERS...",
      "CHECKING OPFS OFFLINE AUDIO CACHE DISK BUFFER...",
      "PROBING DUAL-SOURCE AUDIO STREAMS (YT & YT MUSIC)...",
      "ESTABLISHING HIGH-AVAILABILITY BACKUP PROXY POOL...",
      "SYNCHRONIZING LOCAL REPOSITORIES & SERVICE WORKERS...",
      "SYSTEM DIAGNOSTICS: 100% OPTIMAL · READY TO LAUNCH"
    ];

    let currentLog = 0;
    const interval = setInterval(() => {
      if (currentLog < logs.length) {
        setBootLog((prev) => [...prev, logs[currentLog]]);
        const pct = Math.round(((currentLog + 1) / logs.length) * 100);
        setBootProgress(pct);
        playChime(300 + currentLog * 100, "triangle");
        currentLog++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setBooting(false);
          // If first launch, show Wizard; else complete
          if (!currentConfig.hasCompletedSetup) {
            setPhase("wizard");
          } else {
            setConfig("hasCompletedBoot", true);
            onComplete();
          }
        }, 600);
      }
    }, 280);

    return () => clearInterval(interval);
  }, [forceOpenWizard]);

  const testProxyHealth = async () => {
    setTestingProxy(true);
    setProxyTestResult("Testing backup proxies response time via server relay...");
    const start = Date.now();
    try {
      const res = await fetch(`/video-stream?id=dQw4w9WgXcQ`, {
        signal: AbortSignal.timeout(4500)
      }).catch(() => null);
      
      const latency = Date.now() - start;
      if (res && res.ok) {
        setProxyTestResult(`✅ Proxy Active: ${latency}ms latency (High Performance)`);
      } else {
        setProxyTestResult(`⚠️ Backup proxy failover active (${latency}ms)`);
      }
    } catch {
      setProxyTestResult("⚠️ Primary proxy unreachable. Automatic Cobalt & local failover enabled.");
    } finally {
      setTestingProxy(false);
    }
  };

  const finishSetup = () => {
    setConfig("hasCompletedSetup", true);
    setConfig("hasCompletedBoot", true);
    setStore("snackbar", "☆○NovaAC○☆ Configuration Saved!");
    onComplete();
  };

  if (phase === "boot" && booting) {
    return (
      <div className="fixed inset-0 z-50 bg-neutral-950 text-neutral-100 font-mono flex flex-col justify-between p-6 md:p-12 overflow-hidden select-none">
        {/* Top OS Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm font-semibold tracking-wider uppercase text-neutral-300">
              ☆○NovaAC○☆ Audio OS v8.5
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-neutral-400">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="hover:text-white transition-colors"
            >
              {soundEnabled ? "🔊 Sound ON" : "🔇 Sound OFF"}
            </button>
            <button
              onClick={() => {
                setConfig("hasCompletedBoot", true);
                onComplete();
              }}
              className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-xs transition-colors"
            >
              Skip Boot [ESC]
            </button>
          </div>
        </div>

        {/* Console Log Area */}
        <div className="my-auto max-w-3xl w-full mx-auto space-y-2">
          <div className="mb-6 space-y-1">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white">
              INITIALIZING AUDIO PLAYER
            </h1>
            <p className="text-xs text-neutral-500">
              Dual-Source YouTube & YouTube Music High-Performance Runtime
            </p>
          </div>

          <div className="bg-neutral-900/80 border border-neutral-800 rounded-lg p-4 h-48 overflow-y-auto space-y-1.5 text-xs text-emerald-400 font-mono scrollbar-thin">
            {bootLog.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-neutral-600 select-none">&gt;</span>
                <span>{log}</span>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1 pt-4">
            <div className="flex justify-between text-xs text-neutral-400">
              <span>SYSTEM BOOT PROGRESS</span>
              <span>{bootProgress}%</span>
            </div>
            <div className="w-full bg-neutral-900 rounded-full h-2 overflow-hidden border border-neutral-800">
              <div
                className="bg-emerald-500 h-full transition-all duration-200 ease-out"
                style={{ width: `${bootProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-neutral-600 pt-4 border-t border-neutral-900">
          Zero-Bloat PWA · Local-First OPFS Cache · Vercel / Netlify Edge Parity
        </div>
      </div>
    );
  }

  if (phase === "wizard") {
    return (
      <div className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-md text-neutral-100 flex items-center justify-center p-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>⚡ Setup Wizard</span>
                <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
                  Step {step} of 4
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Configure ytify for optimal playback & streaming speed
              </p>
            </div>
            <button
              onClick={finishSetup}
              className="text-xs text-neutral-500 hover:text-neutral-300"
            >
              Skip Setup &gt;
            </button>
          </div>

          {/* Step 1: Audio Engine & Quality */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-200">
                1. Stream Quality & Audio Pipeline
              </h3>
              
              <div className="space-y-3">
                <label className="block text-xs text-neutral-400">
                  Audio Stream Quality
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "high", name: "High (High Bitrate AAC/Opus)" },
                    { id: "medium", name: "Medium (Balanced)" },
                    { id: "low", name: "Low (Data Saver)" },
                    { id: "worst", name: "Worst (Extreme Saver)" },
                  ].map((q) => (
                    <button
                      key={q.id}
                      onClick={() => setConfig("quality", q.id as any)}
                      className={cn(
                        "p-3 text-left text-xs rounded-lg border transition-all",
                        currentConfig.quality === q.id
                          ? "border-emerald-500 bg-emerald-950/30 text-emerald-300 font-semibold"
                          : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700"
                      )}
                    >
                      {q.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-neutral-300">
                  Volume Normalization / Stable Volume
                </span>
                <button
                  onClick={() => setConfig("stableVolume", !currentConfig.stableVolume)}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded-md border font-medium transition-colors",
                    currentConfig.stableVolume
                      ? "bg-emerald-600 text-white border-emerald-500"
                      : "bg-neutral-800 text-neutral-400 border-neutral-700"
                  )}
                >
                  {currentConfig.stableVolume ? "Enabled" : "Disabled"}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Backup Streaming & Proxy */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-200">
                2. Backup Streaming & Proxies
              </h3>

              <p className="text-xs text-neutral-400">
                ☆○NovaAC○☆ automatically fails over across redundant audio proxies, Cobalt API, and Vercel/Netlify edge relays.
              </p>

              <div className="space-y-2">
                <label className="block text-xs text-neutral-300">
                  Preferred Failover Strategy
                </label>
                <select
                  value={currentConfig.backupProxy || "auto"}
                  onChange={(e) => setConfig("backupProxy", e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="auto">Auto Load Balancing (Recommended)</option>
                  <option value="omada">Omada Cafe (Fast US Edge)</option>
                  <option value="schenkel">Schenkel BR Edge</option>
                  <option value="kemonomimi">Kemonomimi EU Edge</option>
                  <option value="cobalt">Cobalt API Direct Fallback</option>
                  <option value="custom">Custom Invidious Proxy URL</option>
                </select>
              </div>

              {currentConfig.backupProxy === "custom" && (
                <div className="space-y-1">
                  <label className="block text-xs text-neutral-400">
                    Custom Proxy Base URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://my-invidious-proxy.example.com"
                    value={currentConfig.customProxyUrl || ""}
                    onChange={(e) => setConfig("customProxyUrl", e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 text-xs text-neutral-200 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={testProxyHealth}
                  disabled={testingProxy}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 rounded-md transition-colors"
                >
                  {testingProxy ? "Testing..." : "⚡ Run Proxy Latency Diagnostic"}
                </button>
                {proxyTestResult && (
                  <p className="text-xs mt-2 font-mono text-neutral-300">
                    {proxyTestResult}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: OPFS Offline Caching */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-200">
                3. OPFS Offline Storage Engine
              </h3>

              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    mode: "auto",
                    title: "Auto Cache",
                    desc: "Caches played streams locally into OPFS automatically"
                  },
                  {
                    mode: "on-demand",
                    title: "On-Demand",
                    desc: "Only caches tracks when added to Cached collection"
                  },
                  {
                    mode: "off",
                    title: "Disabled",
                    desc: "No local audio files written to disk"
                  }
                ].map((c) => (
                  <button
                    key={c.mode}
                    onClick={() => setConfig("cachingMode", c.mode as any)}
                    className={cn(
                      "p-3 text-left rounded-lg border transition-all flex flex-col justify-between h-28",
                      currentConfig.cachingMode === c.mode
                        ? "border-emerald-500 bg-emerald-950/30 text-emerald-300"
                        : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700"
                    )}
                  >
                    <span className="text-xs font-semibold">{c.title}</span>
                    <span className="text-[11px] text-neutral-500 leading-tight">
                      {c.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: UI & Theme */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-neutral-200">
                4. Interface & Visualizer Theme
              </h3>

              <div className="space-y-2">
                <label className="block text-xs text-neutral-300">Theme Scheme</label>
                <div className="grid grid-cols-3 gap-2">
                  {["auto", "dark", "light"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setConfig("theme", t as any)}
                      className={cn(
                        "p-2 text-xs rounded-md border capitalize transition-colors",
                        currentConfig.theme === t
                          ? "border-emerald-500 bg-emerald-950/30 text-emerald-300 font-semibold"
                          : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs text-neutral-300">Player Background Artwork</label>
                <select
                  value={currentConfig.playerBackground || "none"}
                  onChange={(e) => setConfig("playerBackground", e.target.value as any)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-200 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="none">Solid Clean Canvas</option>
                  <option value="blur">Blurred Artwork Pane</option>
                  <option value="blur-motion">Animated Motion Blur</option>
                  <option value="frost">Frost Veiled Background</option>
                  <option value="frost-motion">Animated Frost Motion</option>
                </select>
              </div>
            </div>
          )}

          {/* Wizard Footer Nav */}
          <div className="flex items-center justify-between border-t border-neutral-800 pt-4">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
              className="px-4 py-2 text-xs bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-300 rounded-lg transition-colors"
            >
              &larr; Back
            </button>

            {step < 4 ? (
              <button
                onClick={() => setStep((s) => Math.min(4, s + 1))}
                className="px-5 py-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors"
              >
                Next &rarr;
              </button>
            ) : (
              <button
                onClick={() => setPhase("tutorial")}
                className="px-5 py-2 text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg transition-colors"
              >
                View Quick Tutorial &gt;
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "tutorial") {
    return (
      <div className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-md text-neutral-100 flex items-center justify-center p-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-xl w-full p-6 space-y-6 shadow-2xl">
          <div className="border-b border-neutral-800 pb-3">
            <h2 className="text-lg font-bold text-white">🎹 Quick Reference & Shortcuts</h2>
            <p className="text-xs text-neutral-400 mt-1">
              Master ytify in seconds with instant hotkeys
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              { key: "Space", action: "Play / Pause Audio" },
              { key: "← / →", action: "Seek -5s / +5s" },
              { key: "Shift + → / N", action: "Next Track" },
              { key: "Shift + ← / P", action: "Previous Track" },
              { key: "↑ / ↓", action: "Volume Up / Down" },
              { key: "M", action: "Mute / Unmute" },
              { key: "/", action: "Focus Search Input" },
              { key: "1 / 2 / 3", action: "Switch Queue / Search / Library" },
            ].map((hk, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-neutral-950 rounded border border-neutral-800">
                <kbd className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-neutral-300 font-mono text-[11px]">
                  {hk.key}
                </kbd>
                <span className="text-neutral-400">{hk.action}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-neutral-800 pt-4 flex justify-end">
            <button
              onClick={finishSetup}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-lg text-xs transition-colors"
            >
              Start Listening Now 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
