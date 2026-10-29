import React, { useMemo } from "react";
import { useSearchStore } from "@stores";
import { useConfig } from "@config";
import ListItem from "@components/ListItem";
import StreamItem from "@components/StreamItem";

export default function SearchResults() {
  const searchStore = useSearchStore();
  const config = useConfig();

  const isAllFilter = config.searchFilter === "all";

  const carouselItems = useMemo(
    () =>
      isAllFilter
        ? searchStore.results.filter(
            (i) =>
              i.type === "channel" ||
              i.type === "artist" ||
              i.type === "playlist",
          )
        : [],
    [isAllFilter, searchStore.results],
  );

  const streamResults = useMemo(
    () =>
      isAllFilter
        ? searchStore.results.filter(
            (i) =>
              i.type !== "channel" &&
              i.type !== "artist" &&
              i.type !== "playlist",
          )
        : searchStore.results,
    [isAllFilter, searchStore.results],
  );

  return (
    <>
      {searchStore.isLoading && (
        <i className="ri-loader-3-line loading-spinner"></i>
      )}

      {carouselItems.length > 0 && (
        <div className="list-carousel">
          {carouselItems.map((item) => (
            <ListItem key={item.id} {...(item as YTListItem)} />
          ))}
        </div>
      )}

      <div className="searchlist">
        {streamResults.map((item) =>
          item.type === "video" || item.type === "song" ? (
            <StreamItem
              key={item.id}
              {...{
                ...(item as YTItem),
                context: {
                  src: "search",
                  id: searchStore.query,
                },
              }}
            />
          ) : (
            <ListItem key={item.id} {...(item as YTListItem)} />
          ),
        )}
      </div>
    </>
  );
}
