import React from "react";
import { playNext, t } from "@stores";

export default function PlayNextButton() {
  return (
    <button
      aria-label={t("player_play_next")}
      className="ri-skip-forward-fill"
      id="playNextButton"
      onClick={playNext}
    ></button>
  );
}
