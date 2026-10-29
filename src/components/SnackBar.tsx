import React, { useEffect, useRef } from "react";
import { setStore, useAppStore } from "@stores";

export default function SnackBar() {
  const store = useAppStore();
  const snackbarRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const current = store.snackbar;
    if (!current) return;
    const timer = setTimeout(() => {
      if (store.snackbar === current) {
        setStore("snackbar", undefined);
      }
    }, 7000);
    return () => clearTimeout(timer);
  }, [store.snackbar]);

  if (!store.snackbar) return null;

  return (
    <p
      ref={snackbarRef}
      style={{
        position: "absolute",
        zIndex: 9,
        bottom: "10dvmin",
        left: "10dvmin",
        maxWidth: "90dvmin",
        padding: "var(--size-1) var(--size-2)",
        backgroundColor: "var(--bg)",
        color: "var(--text)",
        border: "var(--border)",
        borderRadius: "var(--roundness)",
        animation:
          "var(--animation-fade-out) forwards, var(--animation-slide-out-down)",
        animationTimingFunction: "var(--ease-elastic-in-out-3)",
        animationDuration: "1s",
      }}
      onClick={() => {
        setStore("snackbar", undefined);
      }}
    >
      {store.snackbar}
    </p>
  );
}
