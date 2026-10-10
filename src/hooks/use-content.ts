import { useEffect, useState } from "react";
import type { Article, CollectionName, GalleryImage, Video } from "@/lib/content";
import { loadArticles, loadGallery, loadVideos } from "@/lib/public-content";

export function usePublishedContent<T extends Article | GalleryImage | Video>(
  name: CollectionName,
  initial: T[],
) {
  const [items, setItems] = useState(initial);
  const [error, setError] = useState("");
  useEffect(() => {
    setItems(initial);
  }, [initial]);
  useEffect(() => {
    let active = true;
    let pending = false;
    const refresh = async () => {
      if (document.visibilityState !== "visible" || pending) return;
      pending = true;
      try {
        const loader =
          name === "articles" ? loadArticles : name === "gallery" ? loadGallery : loadVideos;
        const next = await loader();
        if (active) {
          setItems(next as T[]);
          setError("");
        }
      } catch {
        if (active)
          setError("Updates are temporarily unavailable. Please refresh or contact our team.");
      } finally {
        pending = false;
      }
    };
    // Same-origin server endpoints avoid cross-origin streaming failures in WebKit.
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [name]);
  return { items, error };
}
