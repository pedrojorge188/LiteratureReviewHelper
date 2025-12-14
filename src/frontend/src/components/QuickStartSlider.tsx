import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import ChevronLeftIcon from "../assets/images/fontawesome/chevronLeftIcon.svg?url";
import ChevronRightIcon from "../assets/images/fontawesome/chevronRightIcon.svg?url";

export const QuickStartSlider = () => {
  const { i18n, t } = useTranslation();

  const images = useMemo(
    () => [
      `/quickstart/${i18n.language}/slide-01.png`,
      `/quickstart/${i18n.language}/slide-02.png`,
      `/quickstart/${i18n.language}/slide-03.png`,
      `/quickstart/${i18n.language}/slide-04.png`,
      `/quickstart/${i18n.language}/slide-05.png`,
      `/quickstart/${i18n.language}/slide-06.png`,
      `/quickstart/${i18n.language}/slide-07.png`,
      `/quickstart/${i18n.language}/slide-08.png`,
      `/quickstart/${i18n.language}/slide-09.png`,
      `/quickstart/${i18n.language}/slide-10.png`,
      `/quickstart/${i18n.language}/slide-11.png`,
      `/quickstart/${i18n.language}/slide-12.png`,
    ],
    [i18n.language]
  );

  const descriptions = useMemo(
    () =>
      images.map((_, i) =>
        t(`quickstart:description_slide-${i + 1}`, { defaultValue: "" })
      ),
    [images, t]
  );

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
