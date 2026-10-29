import React, { useState, useEffect, useRef } from "react";
import { getCollection, getTracksMap } from "@modules/library";
import ListItem from "@components/ListItem";
import { t, store } from "@stores";
import { unique, isTopicAuthor } from "@utils";

interface FeaturedResponse {
  featuredPlaylists?: YTPlaylistItem[];
  artists?: Channel[];
}

interface CachedFeatured {
  featuredPlaylists: YTPlaylistItem[];
  timestamp: number;
}

export default function Featured() {
  const [featuredPlaylists, setFeaturedPlaylists] = useState<
    YTPlaylistItem[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const hasAttemptedFetch = useRef(false);

  const updateFeatured = async () => {
    if (hasAttemptedFetch.current) return;
    hasAttemptedFetch.current = true;

    try {
      const cached = sessionStorage.getItem("featured_cache");
      if (cached) {
        const parsed = JSON.parse(cached) as CachedFeatured;
        if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
          setFeaturedPlaylists(parsed.featuredPlaylists || []);
          return;
        }
      }
    } catch {}

    const history = getCollection("history");
    const historyIds = unique(history).filter(Boolean);

    const tracksMap = getTracksMap();
    const favorites = getCollection("favorites")
      .map((id) => tracksMap[id])
      .filter(Boolean);

    const artistCounts: Record<string, number> = {};
    favorites
      .filter((track) => isTopicAuthor(track.author) && track.authorId)
      .forEach((track) => {
        artistCounts[track.authorId] = (artistCounts[track.authorId] || 0) + 2;
      });

    historyIds
      .map((id) => tracksMap[id])
      .filter((track) => isTopicAuthor(track?.author) && track?.authorId)
      .forEach((track) => {
        artistCounts[track.authorId] = (artistCounts[track.authorId] || 0) + 1;
      });

    const artistIds = Object.entries(artistCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id)
      .slice(0, 5);

    if (artistIds.length === 0) {
      setFeaturedPlaylists([]);
      return;
    }

    setIsLoading(true);
    try {
      const artistParam = artistIds.join(",");
      const res = await fetch(
        `${store.api}/featured?artistIds=${encodeURIComponent(artistParam)}&limit=20`,
      );
      if (res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = (await res.json()) as FeaturedResponse;
          const feat = Array.isArray(data.featuredPlaylists)
            ? data.featuredPlaylists
            : [];
          setFeaturedPlaylists(feat);

          try {
            sessionStorage.setItem(
              "featured_cache",
              JSON.stringify({
                featuredPlaylists: feat,
                timestamp: Date.now(),
              }),
            );
          } catch {}

          if (Array.isArray(data.artists)) {
            try {
              sessionStorage.setItem(
                "featured_artists",
                JSON.stringify(data.artists),
              );
            } catch {}
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch featured shelves", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    updateFeatured();
  }, []);

  return (
    <article className="featured-article">
      <p>
        <i className="ri-star-fill"></i>&nbsp;{t("hub_featured")}
      </p>

      {isLoading ? (
        <div className="loading-container">
          <i className="ri-loader-3-line loading-spinner"></i>
        </div>
      ) : featuredPlaylists.length > 0 ? (
        <div className="official-shelf">
          <div className="list-carousel">
            {featuredPlaylists.map((item) => (
              <ListItem
                key={item.id}
                name={item.name}
                id={item.id}
                img={item.img}
                author={item.author || "YouTube Music"}
                type="playlist"
              />
            ))}
          </div>
        </div>
      ) : (
        <div>
          <p className="fallback">{t("hub_featured_fallback")}</p>
        </div>
      )}
    </article>
  );
}
