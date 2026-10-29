import React, { useState, useEffect } from "react";
import { getLists } from "@modules/library";
import StreamItem from "@components/StreamItem";
import ListItem from "@components/ListItem";
import { t, store, useAppStore } from "@stores";

export default function SubFeed() {
  const appStore = useAppStore();
  const channels = getLists("channels");
  const [isSubfeedLoading, setIsSubfeedLoading] = useState(
    Boolean(channels && channels.length > 0),
  );
  const [subfeed, setSubfeed] = useState<YTItem[]>([]);

  const updateSubfeed = async () => {
    if (!channels || channels.length === 0) {
      setSubfeed([]);
      return;
    }
    setIsSubfeedLoading(true);
    const channelIds = channels.map((channel) => channel.id).join(",");
    try {
      const res = await fetch(`${store.api}/subfeed?id=${channelIds}`);
      const data = (await res.json()) as YTItem[];
      setSubfeed(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubfeedLoading(false);
    }
  };

  useEffect(() => {
    if (subfeed.length === 0) {
      updateSubfeed();
    }
  }, [appStore.libraryUpdated]);

  return (
    <article className="subfeed-article">
      <p>
        <i className="ri-tv-fill"></i>&nbsp;{t("hub_subfeed")}
      </p>
      {channels && channels.length > 0 ? (
        <>
          <div className="list-carousel">
            {channels.map((channel) => (
              <ListItem
                key={channel.id}
                name={channel.name}
                img={channel.img}
                id={channel.id}
                type="channel"
              />
            ))}
          </div>

          {(isSubfeedLoading || subfeed.length > 0) && (
            <div className="subfeed-list">
              {isSubfeedLoading ? (
                <div className="loading-container">
                  <i className="ri-loader-3-line loading-spinner"></i>
                </div>
              ) : (
                subfeed.map((item) => <StreamItem key={item.id} {...item} />)
              )}
            </div>
          )}
        </>
      ) : (
        <div>
          <p className="fallback">{t("hub_subfeed_fallback")}</p>
        </div>
      )}
    </article>
  );
}
