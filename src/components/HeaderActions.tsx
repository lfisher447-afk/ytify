import React from "react";
import { useConfig } from "@config";
import { useAppStore, useNavStore, t, openSubView } from "@stores";
import Dropdown from "@features/Library/Dropdown";
import { cn } from "@components/common";

export default function HeaderActions() {
  const config = useConfig();
  const store = useAppStore();
  const navStore = useNavStore();

  return (
    <>
      <div className="right-group">
        {Boolean(config.dbsync) && (
          <i
            id="syncNow"
            className={cn({
              "ri-cloud-fill": store.syncState === "synced",
              "ri-loader-3-line loading-spinner":
                store.syncState === "syncing",
              "ri-cloud-off-fill":
                store.syncState === "dirty" || store.syncState === "error",
              error: store.syncState === "error",
            })}
            aria-label={
              store.syncState === "dirty" || store.syncState === "error"
                ? "Save to Cloud"
                : store.syncState === "synced"
                  ? "Import from Cloud"
                  : "Syncing"
            }
            onClick={() => {
              import("@modules/cloudSync").then(({ runSync }) => {
                runSync(config.dbsync);
              });
            }}
          ></i>
        )}
        {navStore.active !== "settings" && (
          <i
            className="ri-settings-line"
            aria-label={t("nav_settings")}
            onClick={() => openSubView("settings")}
          ></i>
        )}
      </div>

      <Dropdown />
    </>
  );
}