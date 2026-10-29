import {
  navStore,
  useNavStore,
  openSubView,
  t,
  getList,
  useListStore,
  setListStore,
} from "@stores";
import { drawer } from "@config";
import { fetchCollection } from "@modules/library";
import { cn } from "@components/common";

interface HeaderNavProps {
  title?: React.ReactNode;
  extra?: React.ReactNode;
}

export function handleNavClick(
  feature: "queue" | "search" | "library" | "list",
) {
  if (navStore.active === feature) {
    navStore[feature].ref?.scrollIntoView({ behavior: "smooth" });
  } else if (feature === "list") {
    if (drawer.lastList) {
      const { id, type, shared } = drawer.lastList;
      if (type === "collection") fetchCollection(id, shared);
      else getList(id, type as any);
    } else {
      openSubView("list");
    }
  } else {
    openSubView(feature);
  }
}

export default function HeaderNav(props: HeaderNavProps) {
  const navStore = useNavStore();
  const listStore = useListStore();

  const listDisplayName = () => {
    if (listStore.showStreamsNumber) {
      const count = listStore.length || listStore.list?.length || 0;
      return t("list_streams_count", count.toString());
    }
    return listStore.name || t("nav_list");
  };

  const onNavClick = (feature: "queue" | "search" | "library" | "list") => {
    if (navStore.active === feature) {
      navStore[feature].ref?.scrollIntoView({ behavior: "smooth" });
    } else if (feature === "list") {
      if (drawer.lastList) {
        const { id, type, shared } = drawer.lastList;
        if (type === "collection") fetchCollection(id, shared);
        else getList(id, type as any);
      } else {
        openSubView("list");
      }
    } else {
      openSubView(feature);
    }
  };

  return (
    <>
      <div className="header-title flex items-center gap-2">
        <span className="brand-logo text-xs font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 shrink-0">
          ☆○NovaAC○☆
        </span>
        {props.title}
      </div>

      <nav className="header-nav">
        <span
          className={cn(
            "header-nav-item",
            navStore.active === "queue" && "active",
          )}
          onClick={() => onNavClick("queue")}
        >
          {t("nav_queue")}
        </span>
        <span
          className={cn(
            "header-nav-item",
            navStore.active === "search" && "active",
          )}
          onClick={() => onNavClick("search")}
        >
          {t("nav_search")}
        </span>
        <span
          className={cn(
            "header-nav-item",
            navStore.active === "library" && "active",
          )}
          onClick={() => onNavClick("library")}
        >
          {t("nav_library")}
        </span>
        {navStore.active === "list" && (
          <span
            className="header-nav-item header-nav-list active"
            onClick={() => {
              setListStore("showStreamsNumber", (prev: boolean) => !prev);
            }}
            title={listDisplayName()}
          >
            {listDisplayName()}
          </span>
        )}

        {props.extra && <div className="header-nav-extra">{props.extra}</div>}
      </nav>
    </>
  );
}
