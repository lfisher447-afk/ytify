import React, { useState, useEffect, useRef } from "react";
import { setConfig } from "@config";
import { store, setStore, t } from "@stores";

export default function Login({ onClose }: { onClose?: () => void }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const closeDialog = () => {
    dialogRef.current?.close();
    if (onClose) onClose();
    else dialogRef.current?.remove();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    fetch(`${store.api}/syncHash`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pw }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorMessage = await res.text();
          throw new Error(errorMessage);
        }
        return res.text();
      })
      .then((hash) => {
        setStore("snackbar", t("login_syncing"));

        import("@modules/cloudSync").then(({ runSync }) => {
          runSync(hash)
            .then((result) => {
              setStore("snackbar", result.message);
              if (result.success) {
                setConfig("dbsync", hash);
                closeDialog();
              } else if (
                result.message.toLowerCase().includes("quota") ||
                result.message.includes("429") ||
                result.message.includes("503")
              ) {
                setConfig("dbsync", hash);
                closeDialog();
              } else {
                setConfig("dbsync", "");
              }
            })
            .catch(() => {
              setConfig("dbsync", "");
            })
            .finally(() => {
              setLoading(false);
            });
        });
      })
      .catch((error) => {
        setStore("snackbar", t("login_auth_failed") + error.message);
        setLoading(false);
      });
  };

  return (
    <dialog ref={dialogRef} className="displayer">
      <form onSubmit={handleSubmit}>
        <h4>{t("login_title")}</h4>
        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          type="email"
          placeholder={t("login_email_placeholder")}
          required
          autoFocus
          disabled={loading}
        />
        <input
          onChange={(e) => setPw(e.target.value)}
          value={pw}
          type="password"
          placeholder={t("login_pw_placeholder")}
          required
          disabled={!email || loading}
        />
        <span>
          {email && pw && (
            <button type="submit" disabled={loading}>
              {loading ? t("login_syncing_btn") : t("login_enable_sync")}
            </button>
          )}
          <button
            type="button"
            onClick={closeDialog}
            className="ri-close-large-line"
            aria-label={t("login_cancel")}
            disabled={loading}
          ></button>
        </span>
      </form>
    </dialog>
  );
}
