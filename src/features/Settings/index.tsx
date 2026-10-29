import React, { useEffect, useRef } from "react";
import "./Settings.css";
import { setNavStore, t, setStore, updateLang, closeSubView } from "@stores";
import { Selector } from "@components/Selector";
import {
  useCachingMode,
  useConfig,
  setConfig,
  setPlayerBackground,
  usePlayerBackground,
  PanelRatio,
  type CachingMode,
  type PlayerBackground,
} from "@config";
import {
  setCachingMode,
  deleteCollection,
  getCollection,
} from "@modules/library";
import { quickSwitch } from "@modules/playback";
import { themer, applyPanelRatio } from "@modules/theme";
import Dropdown from "./Dropdown";
import { cn } from "@components/common";

export default function SettingsFeature() {
  const settingsSection = useRef<HTMLDivElement>(null);
  const isPWA =
    typeof window !== "undefined" &&
    matchMedia("(display-mode: standalone)").matches;
  const config = useConfig();
  const caching = useCachingMode();
  const playerBg = usePlayerBackground();

  useEffect(() => {
    if (settingsSection.current) {
      setNavStore("settings", "ref", settingsSection.current);
      settingsSection.current.scrollIntoView();
    }
  }, []);

  useEffect(() => {
    updateLang();
  }, [config.language]);

  const Toggle = (props: {
    name: string;
    checked: boolean;
    onClick: (e: React.MouseEvent) => void;
  }) => {
    return (
      <span
        role="checkbox"
        aria-checked={props.checked}
        tabIndex={0}
        onClick={props.onClick}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            props.onClick(e as unknown as React.MouseEvent);
          }
        }}
      >
        <label>{t(props.name as TranslationKeys)}</label>
        <i className={cn(props.checked ? "ri-toggle-fill" : "ri-toggle-line")}></i>
      </span>
    );
  };

  const localesList = typeof Locales !== "undefined" ? Locales : ["en"];

  return (
    <section ref={settingsSection} className="settingsSection">
      <header>
        <p>{t("nav_settings")}</p>
        <i
          aria-label={t("close")}
          className="ri-close-large-line"
          onClick={closeSubView}
        ></i>
        <Dropdown />
      </header>
      <div>
        {/* App Settings */}
        <Selector
          label="settings_language"
          id="languageSelector"
          onchange={(e) => {
            setConfig("language", e.target.value);
            setStore("locale", e.target.value);
            setStore("snackbar", t("settings_reload"));
          }}
          value={
            typeof document !== "undefined"
              ? document.documentElement.lang
              : "en"
          }
        >
          {localesList.map((item) => (
            <option key={item} value={item}>
              {new Intl.DisplayNames(
                typeof document !== "undefined"
                  ? document.documentElement.lang
                  : "en",
                {
                  type: "language",
                },
              ).of(item)}
            </option>
          ))}
        </Selector>

        {isPWA && (
          <Selector
            id="shareAction"
            label="settings_pwa_share_action"
            onchange={(e) => {
              setConfig("shareAction", e.target.value as "play" | "watch");
            }}
            value={config.shareAction}
          >
            <option value="play">{t("player_play_button")}</option>
            <option value="watch">{t("settings_pwa_watch")}</option>
          </Selector>
        )}

        {/* Playback Settings */}
        <Selector
          label="settings_audio_quality"
          id="qualityPreference"
          onchange={async (e) => {
            setConfig(
              "quality",
              e.target.value as "worst" | "low" | "medium" | "high",
            );
            quickSwitch();
          }}
          value={config.quality}
        >
          <option value="worst">{t("settings_quality_worst")}</option>
          <option value="low">{t("settings_quality_low")}</option>
          <option value="medium">{t("settings_quality_medium")}</option>
          <option value="high">{t("settings_quality_high")}</option>
        </Selector>

        <Toggle
          name="settings_stable_volume"
          checked={Boolean(config.stableVolume)}
          onClick={() => {
            setConfig("stableVolume", !config.stableVolume);
            quickSwitch();
          }}
        />

        <Toggle
          name="settings_watchmode"
          checked={Boolean(config.watchMode)}
          onClick={() => {
            setConfig("watchMode", config.watchMode ? "" : "144p");
          }}
        />

        <Toggle
          name="settings_sponsorblock"
          checked={Boolean(config.sponsorblock)}
          onClick={() => {
            setConfig("sponsorblock", !config.sponsorblock);
          }}
        />

        {/* Library Settings */}
        <Toggle
          name="settings_store_history"
          checked={config.history}
          onClick={() => {
            let configVal = !config.history;
            if (!configVal) {
              const db = getCollection("history") || [];
              const count = db.length;
              if (confirm(t("settings_clear_history", count.toString()))) {
                deleteCollection("history");
                configVal = false;
              } else return;
            }
            setConfig("history", configVal);
          }}
        />

        {/* Caching Settings */}
        <Selector
          label="settings_caching_mode"
          id="cachingModeSelector"
          onchange={(e) => setCachingMode(e.target.value as CachingMode)}
          value={caching}
        >
          <option value="auto">{t("settings_caching_mode_auto")}</option>
          <option value="on-demand">
            {t("settings_caching_mode_on_demand")}
          </option>
          <option value="off">{t("settings_caching_mode_off")}</option>
        </Selector>

        {/* Search Settings */}
        <Toggle
          name="settings_link_capturing"
          checked={config.searchBarLinkCapture}
          onClick={() => {
            setConfig("searchBarLinkCapture", !config.searchBarLinkCapture);
          }}
        />

        <Toggle
          name="settings_display_suggestions"
          checked={config.searchSuggestions}
          onClick={() => {
            setConfig("searchSuggestions", !config.searchSuggestions);
            setStore("snackbar", t("settings_reload"));
          }}
        />

        <Toggle
          name="settings_save_recent_searches"
          checked={config.saveRecentSearches}
          onClick={() => {
            setConfig("saveRecentSearches", !config.saveRecentSearches);
          }}
        />

        {/* Personalize Settings */}
        <Toggle
          name="settings_load_images"
          checked={config.loadImage}
          onClick={() => {
            setConfig("loadImage", !config.loadImage);
            setStore("snackbar", t("settings_reload"));
          }}
        />

        <Selector
          label="settings_player_background"
          id="playerBackgroundSelector"
          onchange={(e) =>
            setPlayerBackground(e.target.value as PlayerBackground)
          }
          value={playerBg}
        >
          <option value="none">{t("settings_bg_none")}</option>
          <option value="frost">{t("settings_bg_frost")}</option>
          <option value="frost-motion">{t("settings_bg_frost_motion")}</option>
          <option value="blur">{t("settings_bg_blur")}</option>
          <option value="blur-motion">{t("settings_bg_blur_motion")}</option>
        </Selector>

        <Selector
          label="settings_panel_ratio"
          onchange={(e) => {
            const val = e.target.value as PanelRatio;
            applyPanelRatio(val);
            setConfig("panelRatio", val);
          }}
          id="panelRatioSelector"
          value={config.panelRatio || "2:5"}
        >
          <option value="1:1">1:1 (Equal)</option>
          <option value="2:3">2:3 (Compact Player)</option>
          <option value="3:4">3:4 (Narrow Player)</option>
          <option value="1:2">1:2 (Slim Player)</option>
          <option value="2:5">2:5 (Ultra Slim)</option>
        </Selector>

        <Selector
          label="settings_theming_scheme"
          id="themeSelector"
          onchange={(e) => {
            themer();
            setConfig("theme", e.target.value as "auto" | "light" | "dark");
          }}
          value={config.theme}
        >
          <option value="auto">
            {t("settings_theming_scheme_system")}
          </option>
          <option value="light">{t("settings_theming_scheme_light")}</option>
          <option value="dark">{t("settings_theming_scheme_dark")}</option>
        </Selector>
      </div>
      <br />
      <br />
    </section>
  );
}
