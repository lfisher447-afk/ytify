import React from "react";
import { useNavStore, openSubView, t, getList } from "@stores";
import { drawer } from "@config";
import { fetchCollection } from "@modules/library";
import { cn } from "@components/common";

export default function NavBar() {
  const navStore = useNavStore();

  return (
    <nav className="app-navbar">
      <i
        aria-label={t("nav_queue")}
        className={cn("ri-order-play-fill", navStore.active === "queue" && "on")}
        onClick={() => {
          if (navStore.active === "queue") {
            navStore.queue.ref?.scrollIntoView({ behavior: "smooth" });
          } else {
            openSubView("queue");
          }
        }}
      ></i>

      <i
        aria-label={t("nav_search")}
        className={cn(
          "ri-search-2-" + (navStore.active === "search" ? "fill" : "line"),
          navStore.active === "search" && "on",
        )}
        onClick={() => {
          if (navStore.active === "search") {
            navStore.search.ref?.scrollIntoView({ behavior: "smooth" });
          } else {
            openSubView("search");
          }
        }}
      ></i>

      <i
        aria-label={t("nav_library")}
        className={cn(
          "ri-archive-stack-" +
            (navStore.active === "library" ? "fill" : "line"),
          navStore.active === "library" && "on",
        )}
        onClick={() => {
          if (navStore.active === "library") {
            navStore.library.ref?.scrollIntoView({ behavior: "smooth" });
          } else {
            openSubView("library");
          }
        }}
      ></i>

      <i
        aria-label={t("nav_list")}
        className={cn(
          "ri-play-list-2-fill nav-list-btn",
          navStore.active === "list" && "on",
        )}
        onClick={() => {
          if (navStore.active === "list") {
            navStore.list.ref?.scrollIntoView({ behavior: "smooth" });
          } else if (drawer.lastList) {
            const { id, type, shared } = drawer.lastList;
            if (type === "collection") fetchCollection(id, shared);
            else getList(id, type as any);
          } else {
            openSubView("list");
          }
        }}
      ></i>
    </nav>
  );
}
