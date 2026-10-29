import React, { useState, useMemo, useRef } from "react";
import {
  useLibrarySections,
  useCachingMode,
  type LibrarySectionKey,
} from "@config";
import {
  CACHED_COLLECTION,
  DISCOVERY_COLLECTION,
  fetchCollection,
  getCollectionsKeys,
  getTracksMap,
  RESERVED_COLLECTIONS,
} from "@modules/library";
import { t, useAppStore } from "@stores";
import StreamItem from "@components/StreamItem";

export default function Collections() {
  const store = useAppStore();
  const searchBar = useRef<HTMLInputElement>(null);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [isTruncated, setIsTruncated] = useState(false);
  const [searchFn, setSearchFn] = useState<
    | ((
        searchTerm: string,
        tracksMap: Collection,
      ) => { results: TrackItem[]; isTruncated: boolean })
    | null
  >(null);

  const sections = useLibrarySections();
  const caching = useCachingMode();

  const loadFinder = async () => {
    if (searchFn) return;
    const mod = await import("@modules/finder");
    setSearchFn(() => mod.default);
  };

  const tracksMap = useMemo(() => {
    return getTracksMap();
  }, [store.libraryUpdated]);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearchText(val);
    }, 300);
    setSearchText(val);
  };

  const isCollectionVisible = (item: string) => {
    return item in sections
      ? Boolean(sections[item as LibrarySectionKey])
      : true;
  };

  const visibleCollections = useMemo(() => {
    return getCollectionsKeys().filter(isCollectionVisible);
  }, [store.libraryUpdated, sections]);

  const showCached = caching !== "off" && sections.cached;

  const hasVisibleItems =
    visibleCollections.length > 0 || showCached || sections.discovery;

  const searchResults = useMemo(() => {
    if (!searchFn || !debouncedSearchText) return [];
    const { results, isTruncated: truncated } = searchFn(
      debouncedSearchText,
      tracksMap,
    );
    setIsTruncated(truncated);
    return results;
  }, [searchFn, debouncedSearchText, tracksMap]);

  return (
    <>
      <input
        ref={searchBar}
        type="text"
        placeholder={t("library_search_placeholder")}
        onChange={handleInput}
        value={searchText}
        onFocus={loadFinder}
      />
      {searchText ? (
        <>
          {searchResults.map((item) => (
            <StreamItem
              key={item.id}
              id={item.id}
              title={item.title}
              author={item.author}
              duration={item.duration}
              authorId={item.authorId}
              type="video"
              context={{
                src: "search",
                id: searchText,
              }}
            />
          ))}
          {isTruncated && (
            <div className="truncated-message">
              {t("library_too_many_results")}
            </div>
          )}
        </>
      ) : hasVisibleItems ? (
        <>
          {visibleCollections.map((item) => (
            <a
              key={item}
              href={"?collection=" + item}
              className="clxn_item"
              onClick={(e) => {
                e.preventDefault();
                fetchCollection(item);
              }}
            >
              {item in RESERVED_COLLECTIONS ? (
                <>
                  <i className={RESERVED_COLLECTIONS[item][0]}></i>
                  {t(RESERVED_COLLECTIONS[item][1])}
                </>
              ) : (
                <>
                  <i className="ri-play-list-2-fill"></i>
                  {item}
                </>
              )}
            </a>
          ))}
          {showCached && (
            <a
              href={"?collection=" + CACHED_COLLECTION}
              className="clxn_item"
              onClick={(e) => {
                e.preventDefault();
                fetchCollection(CACHED_COLLECTION);
              }}
            >
              <i className={RESERVED_COLLECTIONS[CACHED_COLLECTION][0]}></i>
              {t(RESERVED_COLLECTIONS[CACHED_COLLECTION][1])}
            </a>
          )}
          {sections.discovery && (
            <a
              href={"?collection=" + DISCOVERY_COLLECTION}
              className="clxn_item"
              onClick={(e) => {
                e.preventDefault();
                fetchCollection(DISCOVERY_COLLECTION);
              }}
            >
              <i className={RESERVED_COLLECTIONS[DISCOVERY_COLLECTION][0]}></i>
              {t(RESERVED_COLLECTIONS[DISCOVERY_COLLECTION][1])}
            </a>
          )}
        </>
      ) : (
        <p>{t("library_empty")}</p>
      )}
    </>
  );
}
