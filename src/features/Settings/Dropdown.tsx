import React from "react";
import { t } from "@stores";
import { lsGet, lsRemove, lsSet } from "@utils";

export default function Dropdown() {
  async function clearCache(e: React.MouseEvent) {
    if (typeof caches !== "undefined") {
      await caches.keys().then((keys) => {
        keys.forEach((k) => caches.delete(k));
      });
    }
    if (typeof navigator !== "undefined" && navigator.serviceWorker) {
      await navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((r) => r.unregister());
      });
    }

    if (e?.type === "click") location.reload();
  }

  function exportSettings() {
    const link = document.createElement("a");
    const date = new Date().toISOString().split("T")[0];
    link.download = `ytify_settings_${date}.json`;
    link.href = `data:text/json;charset=utf-8,${encodeURIComponent(lsGet("config") || "{}")}`;
    link.click();
  }

  async function importSettings(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    const files = e.target.files;
    if (!files || !files[0]) return;
    const newSettings = await files[0].text();

    if (confirm(t("settings_import_prompt"))) lsSet("config", newSettings);
  }

  return (
    <details>
      <summary>
        <i
          aria-label={t("settings_more_options")}
          className="ri-more-2-fill"
        ></i>
      </summary>
      <ul>
        <li onClick={clearCache}>
          <i className="ri-delete-bin-2-line"></i>&nbsp;{t("settings_clear_cache")}
        </li>
        <li
          onClick={() => {
            lsRemove("config");
            location.reload();
          }}
        >
          <i className="ri-refresh-line"></i>&nbsp;{t("settings_restore")}
        </li>
        <li onClick={exportSettings}>
          <i className="ri-export-line"></i>&nbsp;{t("settings_export")}
        </li>
        <li>
          <label htmlFor="importSettingsBtn">
            <i className="ri-import-line"></i>&nbsp;{t("settings_import")}
          </label>
          <input
            type="file"
            id="importSettingsBtn"
            style={{ display: "none" }}
            onChange={importSettings}
          />
        </li>
      </ul>
    </details>
  );
}
