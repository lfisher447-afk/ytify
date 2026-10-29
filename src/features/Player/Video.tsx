import React, { useState, useEffect, useRef } from "react";
import { generateImageUrl } from "@utils";
import { useConfig, setConfig } from "@config";
import { proxyHandler } from "@modules/playback";
import {
  usePlayerStore,
  playNext,
  setPlayerStore,
  t,
  useQueueStore,
} from "@stores";

export default function Video() {
  const [data, setData] = useState<{
    video: string[][];
    captions: Invidious["captions"];
  }>({
    video: [],
    captions: [],
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const selectorRef = useRef<HTMLSelectElement>(null);
  const config = useConfig();
  const playerStore = usePlayerStore();
  const queueStore = useQueueStore();

  const savedQ =
    config.watchMode ||
    ({ worst: "144p", low: "240", medium: "360p", high: "720p" } as any)[
      config.quality
    ];

  useEffect(() => {
    let active = true;
    if (!playerStore.stream.id) return;
    playerStore.audio.pause();

    (async () => {
      let supportsAv1 = false;
      if (typeof navigator !== "undefined" && navigator.mediaCapabilities) {
        supportsAv1 = await navigator.mediaCapabilities
          .decodingInfo({
            type: "file",
            video: {
              contentType: 'video/mp4; codecs="av01.0.00M.08"',
              bitrate: 1e7,
              framerate: 22,
              height: 720,
              width: 1280,
            },
          })
          .then((result) => result.supported)
          .catch(() => false);
      }

      if (!active) return;

      const d = playerStore.data as Invidious;
      if (!d || !d.adaptiveFormats) return;

      const hasAv1 =
        d.adaptiveFormats.filter((v) => v.type?.includes("av01")).length === 4
          ? d.adaptiveFormats.find((v) => v.type?.includes("av01"))?.url
          : false;
      const hasVp9 = d.adaptiveFormats.find((v) =>
        v.type?.includes("vp9"),
      )?.url;

      if (videoRef.current) {
        videoRef.current.currentTime = playerStore.audio.currentTime;
      }

      setData({
        video: d.adaptiveFormats
          .filter((f) => {
            if (!f.type.startsWith("video")) return false;
            const av1 = hasAv1 && supportsAv1 && f.type?.includes("av01");
            if (av1) return true;
            const vp9 = !hasAv1 && f.type?.includes("vp9");
            if (vp9) return true;
            const avc = !hasVp9 && f.type?.includes("avc1");
            if (avc) return true;
            return false;
          })
          .map((f) => [f.resolution || f.quality, f.url]),
        captions: (d.captions || []).map((c) => ({
          ...c,
          url: (playerStore.proxy || "") + c.url,
        })),
      });

      if (videoRef.current) {
        if (videoRef.current.src) {
          videoRef.current.src = "";
          videoRef.current.pause();
        }
        delete videoRef.current.dataset.retried;
        if (savedQ && selectorRef.current?.value) {
          videoRef.current.src = proxyHandler(selectorRef.current.value, true);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [playerStore.stream.id]);

  function close() {
    if (videoRef.current) videoRef.current.pause();
    setPlayerStore("status", "");
    setPlayerStore("isWatching", false);
  }

  return (
    <div className="watcher">
      <video
        ref={videoRef}
        controls
        crossOrigin="anonymous"
        poster={generateImageUrl(playerStore.stream.id, "mq")}
        onPlay={() => {
          if (videoRef.current) {
            videoRef.current.currentTime = playerStore.audio.currentTime;
          }
          playerStore.audio.play();
        }}
        onPause={() => {
          if (playerStore.isWatching) playerStore.audio.pause();
          if (videoRef.current) {
            playerStore.audio.currentTime = videoRef.current.currentTime;
          }
        }}
        onEnded={() => {
          if (!queueStore.list.length) {
            close();
            playNext();
          }
        }}
        onWaiting={() => {
          if (!playerStore.audio.paused) playerStore.audio.pause();
        }}
        onTimeUpdate={() => {
          if (!videoRef.current) return;
          const diff = playerStore.audio.currentTime - videoRef.current.currentTime;
          const vpr = videoRef.current.playbackRate;
          const npr = vpr - diff;
          if (npr < 0) return;
          const rpr = Math.round(npr * 100) / 100;
          if (rpr !== playerStore.audio.playbackRate)
            playerStore.audio.playbackRate = rpr;
        }}
        onLoadStart={() => {
          if (videoRef.current) {
            videoRef.current.currentTime = playerStore.audio.currentTime;
            videoRef.current.play();
          }
        }}
        onPlaying={() => {
          if (playerStore.audio.paused) playerStore.audio.play();
        }}
        onSeeked={() => {
          if (videoRef.current) {
            playerStore.audio.currentTime = videoRef.current.currentTime;
          }
        }}
        onRateChange={() => {
          if (videoRef.current) {
            playerStore.audio.playbackRate = videoRef.current.playbackRate;
          }
        }}
        onError={async () => {
          if (!videoRef.current) return;
          const oldOrigin = new URL(videoRef.current.src).origin;
          const { default: audioErrorHandler } = await import(
            "@modules/audioErrorHandler"
          );
          audioErrorHandler(videoRef.current as any);
          if (videoRef.current.dataset.retried) {
            const { proxy, audio } = playerStore;
            audio.src = audio.src.replace(oldOrigin, proxy);
          }
        }}
      >
        {data.captions.map((v) => (
          <track
            key={v.language_code + v.label}
            kind="subtitles"
            src={v.url}
            srcLang={v.language_code}
            label={v.label}
          />
        ))}
      </video>

      <div>
        <button onClick={close}>{t("close")}</button>

        <select
          ref={selectorRef}
          onChange={(e) => {
            if (videoRef.current) {
              videoRef.current.src = proxyHandler(e.target.value, true);
              videoRef.current.currentTime = playerStore.audio.currentTime;
            }
            if (config.watchMode)
              setConfig(
                "watchMode",
                e.target.selectedOptions[0].textContent as string,
              );
          }}
          defaultValue={savedQ}
        >
          <option>{t("player_video_resolution")}</option>
          {data.video.map((f) => (
            <option key={f[0]} value={f[1]}>
              {f[0]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
