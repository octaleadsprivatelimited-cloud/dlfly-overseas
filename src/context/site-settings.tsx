import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { defaultSettings, type SiteSettings } from "@/lib/content";
import { loadSiteSettings } from "@/lib/public-content";

const SiteSettingsContext = createContext<SiteSettings>(defaultSettings);
export function SiteSettingsProvider({
  initial,
  children,
}: {
  initial: SiteSettings;
  children: ReactNode;
}) {
  const [settings, setSettings] = useState(initial);
  useEffect(() => {
    setSettings(initial);
  }, [initial]);
  useEffect(() => {
    let active = true;
    let pending = false;
    const refresh = async () => {
      if (document.visibilityState !== "visible" || pending) return;
      pending = true;
      try {
        const next = await loadSiteSettings();
        if (active)
          setSettings((current) =>
            JSON.stringify(current) === JSON.stringify(next) ? current : next,
          );
      } catch {
        /* Keep verified settings during an interrupted request. */
      } finally {
        pending = false;
      }
    };
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  return <SiteSettingsContext.Provider value={settings}>{children}</SiteSettingsContext.Provider>;
}
export const useSiteSettings = () => useContext(SiteSettingsContext);
