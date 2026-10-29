import React from "react";
import { usePlayerStore } from "@stores";
import { hostResolver } from "@utils";

export default function MediaDetails() {
  const playerStore = usePlayerStore();

  return (
    <div className="mediaDetails">
      <a
        id="title"
        href={hostResolver(`/watch?v=${playerStore.stream.id}`)}
        target="_blank"
        rel="noreferrer"
      >
        {playerStore.status || playerStore.stream.title}
      </a>
      <p id="author">
        {playerStore.stream.author?.replace("- Topic", "") ?? ""}
      </p>
    </div>
  );
}
