import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import ChevronLeftIcon from "../assets/images/fontawesome/chevronLeftIcon.svg?url";
import ChevronRightIcon from "../assets/images/fontawesome/chevronRightIcon.svg?url";

export const QuickStartSlider = () => {
  const { t } = useTranslation();

  const quickstartModules = import.meta.glob("../assets/images/quickstart/*", { eager: true, as: "url" }) as Record<string, string>;

  const discoveredItems = useMemo(() => {
    const entries = Object.entries(quickstartModules).sort(([a], [b]) => a.localeCompare(b));
    return entries.map(([modulePath, url]) => {
      const file = modulePath.split("/").pop() || "";
      const name = file.replace(/\.[^.]+$/, "").toLowerCase();
      return { modulePath, url, name };
    });
  }, [quickstartModules]);

  const discovered = useMemo(() => discoveredItems.map((d) => d.url), [discoveredItems]);

  const images = discovered;

  const descriptions = useMemo(() => {
    return discoveredItems.map((item, i) => {
      const key = `quickstart:description_${item.name}`;
      const translated = t(key, { defaultValue: "" });
      return translated;
    });
  }, [discoveredItems, t]);

  const [current, setCurrent] = useState<number>(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ aspectRatio: "16/9", maxHeight: "70vh", border: "1px solid #ddd", borderRadius: 6, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa" }}>
          <img src={images[current]} alt={`slide-${current}`} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setCurrent((c) => Math.max(0, c - 1))} disabled={current === 0} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
            <img src={ChevronLeftIcon} alt="Prev" style={{ width: 18, height: 18 }} />
          </button>
          <div style={{ flex: 1, textAlign: "center" }}>{`${current + 1} / ${images.length}`}</div>
          <button onClick={() => setCurrent((c) => Math.min(images.length - 1, c + 1))} disabled={current >= images.length - 1} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
            <img src={ChevronRightIcon} alt="Next" style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <div style={{ width: "100%", minHeight: 160, padding: 12, background: "#fff", border: "1px solid #eee", borderRadius: 4 }}>{descriptions[current]}</div>
    </div>
  );
};
