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
    <div className="quickstart-slider">
      <div className="quickstart-slider__viewport">
        <img
          src={images[current]}
          alt={`slide-${current}`}
          className="quickstart-slider__image"
        />
      </div>

      <div className="quickstart-slider__controls">
        <button
          className="quickstart-slider__button"
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
        >
          <img
            src={ChevronLeftIcon}
            alt="Previous"
            className="quickstart-slider__icon"
          />
        </button>

        <div className="quickstart-slider__counter">
          {current + 1} / {images.length}
        </div>

        <button
          className="quickstart-slider__button"
          onClick={() => setCurrent(c => Math.min(images.length - 1, c + 1))}
          disabled={current >= images.length - 1}
        >
          <img
            src={ChevronRightIcon}
            alt="Next"
            className="quickstart-slider__icon"
          />
        </button>
      </div>

      <div className="quickstart-slider__description">
        {descriptions[current]}
      </div>
    </div>
  );
};
