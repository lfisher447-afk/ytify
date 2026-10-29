import React, { useMemo, useEffect, useRef, Suspense, lazy } from "react";
import "./Library.css";
import Collections from "./Collections";

import { useLibrarySections } from "@config";
import { getLibraryAlbums, getLists } from "@modules/library";
import { t, setNavStore, useAppStore } from "@stores";
import ListItem from "@components/ListItem";
import HeaderActions from "@components/HeaderActions";
import HeaderNav from "@components/HeaderNav";

const SubFeed = lazy(() => import("./SubFeed"));
const Featured = lazy(() => import("./Featured"));

export default function LibraryFeature() {
  const libraryRef = useRef<HTMLElement>(null);
  const store = useAppStore();
  const sections = useLibrarySections();

  useEffect(() => {
    if (libraryRef.current) {
      setNavStore("library", "ref", libraryRef.current);
      libraryRef.current.scrollIntoView();
    }
  }, []);

  const libraryAlbums = useMemo(() => {
    return getLibraryAlbums();
  }, [store.libraryUpdated]);

  const libraryPlaylists = useMemo(() => {
    return getLists("playlists");
  }, [store.libraryUpdated]);

  return (
    <section className="library" ref={libraryRef}>
      <header className="sticky-bar">
        <HeaderNav title={<p>{t("nav_library")}</p>} />
        <HeaderActions />
      </header>

      {sections.subfeed && (
        <Suspense fallback={null}>
          <SubFeed />
        </Suspense>
      )}
      {sections.featured && (
        <Suspense fallback={null}>
          <Featured />
        </Suspense>
      )}
      <Collections />
      <br />
      {libraryAlbums.length > 0 && (
        <article>
          <p>
            <i className="ri-album-fill"></i>&nbsp;
            {t("library_albums")}
          </p>
          <div>
            {libraryAlbums.map((item) => (
              <ListItem
                key={item.id}
                name={item.name}
                id={item.id}
                img={item.img}
                author={item.author}
                type="album"
              />
            ))}
          </div>
        </article>
      )}
      <br />

      {libraryPlaylists.length > 0 && (
        <article>
          <p>
            <i className="ri-youtube-fill"></i>&nbsp;
            {t("library_playlists")}
          </p>
          <div>
            {libraryPlaylists.map((item) => (
              <ListItem
                key={item.id}
                name={item.name}
                id={item.id}
                img={item.img}
                author={item.author}
                type="playlist"
              />
            ))}
          </div>
        </article>
      )}

      <br />
    </section>
  );
}
