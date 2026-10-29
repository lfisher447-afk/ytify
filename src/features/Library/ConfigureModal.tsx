import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { t } from "@stores";
import {
  useCachingMode,
  useLibrarySections,
  setLibrarySection,
  LibrarySectionKey,
} from "@config";

interface SectionConfigItem {
  key: LibrarySectionKey;
  label: TranslationKeys;
  icon: string;
}

const SECTIONS: SectionConfigItem[] = [
  { key: "subfeed", label: "hub_subfeed", icon: "ri-tv-line" },
  { key: "featured", label: "hub_featured", icon: "ri-star-line" },
  {
    key: "listenLater",
    label: "library_listen_later",
    icon: "ri-calendar-schedule-fill",
  },
  { key: "history", label: "library_history", icon: "ri-memories-fill" },
  { key: "favorites", label: "library_favorites", icon: "ri-heart-fill" },
  { key: "liked", label: "library_liked", icon: "ri-thumb-up-fill" },
  { key: "cached", label: "hub_cached", icon: "ri-thunderstorms-fill" },
  { key: "discovery", label: "hub_discovery", icon: "ri-compass-3-fill" },
];

export default function ConfigureModal(props: { close: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const sections = useLibrarySections();
  const cachingMode = useCachingMode();

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (!dialogRef.current) return;
    const rect = dialogRef.current.getBoundingClientRect();
    const isInDialog =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;
    if (!isInDialog) {
      dialogRef.current.close();
      props.close();
    }
  };

  const visibleSections =
    cachingMode === "off"
      ? SECTIONS.filter((item) => item.key !== "cached")
      : SECTIONS;

  return ReactDOM.createPortal(
    <dialog
      ref={dialogRef}
      className="displayer configure-library-modal"
      onClick={handleBackdropClick}
      onClose={props.close}
    >
      <div className="configure-modal-header">
        <h4>{t("library_configure")}</h4>
        <button
          type="button"
          className="ri-close-large-line"
          onClick={() => {
            dialogRef.current?.close();
            props.close();
          }}
          aria-label={t("close")}
        ></button>
      </div>

      <div className="configure-modal-list">
        {visibleSections.map((item) => {
          const isChecked = Boolean(sections[item.key]);
          return (
            <div
              key={item.key}
              className="configure-item"
              role="checkbox"
              aria-checked={isChecked}
              tabIndex={0}
              onClick={() => setLibrarySection(item.key, !isChecked)}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  setLibrarySection(item.key, !isChecked);
                }
              }}
            >
              <span className="configure-item-label">
                <i className={item.icon}></i>
                {t(item.label)}
              </span>
              <i
                className={
                  isChecked
                    ? "ri-toggle-fill toggle-on"
                    : "ri-toggle-line toggle-off"
                }
              ></i>
            </div>
          );
        })}
      </div>
    </dialog>,
    document.body,
  );
}
