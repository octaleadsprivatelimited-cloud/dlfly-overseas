import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import Lenis from "lenis";

export function SmoothScroll() {
  const router = useRouter();

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.12,
      smoothWheel: true,
      virtualScroll: () => !reducedMotion.matches,
      syncTouch: false,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
    });
    const unsubscribe = router.subscribe("onBeforeLoad", ({ pathChanged }) => {
      if (pathChanged) lenis.scrollTo(window.scrollY, { immediate: true });
    });
    const followAnchor = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (
        !(anchor instanceof HTMLAnchorElement) ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      )
        return;
      const url = new URL(anchor.href);
      if (
        url.origin !== location.origin ||
        url.pathname !== location.pathname ||
        url.search !== location.search ||
        !url.hash
      )
        return;
      let id: string;
      try {
        id = decodeURIComponent(url.hash.slice(1));
      } catch {
        return;
      }
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      void router.navigate({ hash: id, resetScroll: false, hashScrollIntoView: false }).then(() => {
        lenis.resize();
        lenis.scrollTo(target, {
          onComplete: () => target.focus({ preventScroll: true }),
        });
      });
    };
    document.addEventListener("click", followAnchor);
    return () => {
      unsubscribe();
      document.removeEventListener("click", followAnchor);
      lenis.destroy();
    };
  }, [router]);

  return null;
}
