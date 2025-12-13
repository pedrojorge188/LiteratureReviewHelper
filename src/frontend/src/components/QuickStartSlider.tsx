import React, { useState, useMemo } from "react";
import ChevronLeftIcon from "../assets/images/fontawesome/chevronLeftIcon.svg?url";
import ChevronRightIcon from "../assets/images/fontawesome/chevronRightIcon.svg?url";

interface Props {
  images?: string[];
  descriptions?: string[];
}

const DEFAULT_PLACEHOLDERS = (() => {
  const make = (label: string, color = "#eaeaea") => {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'><rect width='100%' height='100%' fill='${color}'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='28' fill='#666'>${label}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };
  return [make("Placeholder 1"), make("Placeholder 2", "#f5f7ff"), make("Placeholder 3", "#fff5f5")];
})();

export const QuickStartSlider: React.FC<Props> = ({ images: propImages = [], descriptions: propDescriptions = [] }) => {
  const images = useMemo(() => (propImages && propImages.length > 0 ? propImages : DEFAULT_PLACEHOLDERS), [propImages]);
  const descriptions = useMemo(
    () => (propDescriptions && propDescriptions.length >= images.length ? propDescriptions : images.map((_, i) => propDescriptions[i] || `Static description for slide ${i + 1}.`)),
    [propDescriptions, images]
  );

  const [current, setCurrent] = useState<number>(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
    </div>
  );
};
