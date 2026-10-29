import React, { useState, useRef, Suspense, lazy } from "react";
import { setConfig, useConfig } from "@config";
import { CACHED_COLLECTION, getTracksMap } from "@modules/library";
import { clearOpusCache } from "@modules/audioCache";
import { setStore, t } from "@stores";
import { lsGetJSON, lsKeys, lsRemove, lsSetJSON } from "@utils";
import ConfigureModal from "./ConfigureModal";

const Login = lazy(() => import("@components/Login"));

export default function Dropdown() {
  const [showConfigure, setShowConfigure] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const config = useConfig();

  async function importLibrary(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || !files[0]) return;
    const importedData = JSON.parse(await files[0].text());

    if (importedData.meta) {
      for (const key in importedData) {
        if (Object.prototype.hasOwnProperty.call(importedData, key)) {
          if (key === CACHED_COLLECTION) continue;
          lsSetJSON("library_" + key, importedData[key]);
        }
      }
      setStore("snackbar", t("library_imported"));
      location.reload();
    } else {
      lsSetJSON("library", importedData);
      setStore("snackbar", t("library_migration_v1_v2"));
      location.reload();
    }
  }

  function exportLibrary() {
    const link = document.createElement("a");
    const date = new Date().toISOString().split("T")[0];
    link.download = `ytify_library_${date}.json`;

    const exportedData: { [key: string]: any } = {};
    for (const key of lsKeys("library_")) {
      const name = key.slice(8);
      if (name === CACHED_COLLECTION) continue;
      exportedData[name] = lsGetJSON(key, null);
    }

    link.href = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportedData, undefined, 2))}`;
    link.click();
  }

  async function cleanLibrary() {
    const tracksMap = getTracksMap();
    const count = Object.keys(tracksMap).length;

    if (confirm(t("library_clean_prompt", count.toString()))) {
      for (const key of lsKeys("library")) {
        lsRemove(key);
      }
      await clearOpusCache();
      location.reload();
    }
  }

  return (
    <>
      <details ref={detailsRef}>
        <summary>
          <i aria-label="More Options" className="ri-more-2-fill"></i>
        </summary>
        <ul>
          <li
            onClick={() => {
              detailsRef.current?.removeAttribute("open");
              setShowConfigure(true);
            }}
          >
            <i className="ri-archive-stack-line"></i>&nbsp;{t("library_configure")}
          </li>
          <li onClick={() => document.getElementById("upload_ytify")?.click()}>
            <label>
              <i className="ri-import-line"></i>&nbsp;{t("library_import")}
            </label>
            <input
              type="file"
              id="upload_ytify"
              style={{ display: "none" }}
              onChange={importLibrary}
            />
          </li>
          <li id="exportBtn" onClick={exportLibrary}>
            <i className="ri-export-line"></i>&nbsp;{t("library_export")}
          </li>
          <li id="cleanLibraryBtn" onClick={() => cleanLibrary()}>
            <i className="ri-delete-bin-2-line"></i>&nbsp;{t("library_clean")}
          </li>

          <li
            onClick={() => document.getElementById("upload_songshift")?.click()}
          >
            <label>
              <i className="ri-refresh-line"></i>&nbsp;Import Playlists from
              SongShift
            </label>
            <input
              type="file"
              id="upload_songshift"
              style={{ display: "none" }}
              onChange={async (e) => {
                if (e.target.files?.[0]) {
                  (await import("@modules/importSongshiftStreams")).default(
                    e.target.files[0],
                  );
                }
              }}
            />
          </li>

          <li
            id="importYTPlaylistBtn"
            onClick={async () => {
              detailsRef.current?.removeAttribute("open");
              (await import("@modules/importYouTubePlaylist")).default();
            }}
          >
            <i className="ri-youtube-fill youtube-icon"></i>&nbsp;
            {t("library_import_yt_playlist")}
          </li>

          {config.dbsync ? (
            <li
              onClick={async () => {
                const { cleanupSyncState } = await import("@modules/cloudSync");
                cleanupSyncState();
                setConfig("dbsync", "");
                location.reload();
              }}
            >
              <i className="ri-cloud-fill"></i>&nbsp;Logout
            </li>
          ) : (
            <li
              onClick={() => {
                detailsRef.current?.removeAttribute("open");
                setShowLogin(true);
              }}
            >
              <i className="ri-cloud-fill"></i>&nbsp;Cloud Sync
            </li>
          )}
        </ul>
      </details>
      {showConfigure && (
        <ConfigureModal close={() => setShowConfigure(false)} />
      )}
      {showLogin && (
        <Suspense fallback={null}>
          <Login onClose={() => setShowLogin(false)} />
        </Suspense>
      )}
    </>
  );
}
