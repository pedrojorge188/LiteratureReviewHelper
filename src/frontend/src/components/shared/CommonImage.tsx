import defaultImage from "../../assets/images/png/default.png";

import { CommonImageProps } from "./types";

export const CommonImage = (props: CommonImageProps) => {
  const { src, title, imageClass, lazyLoad, defaultSize } = props;
  let bootSizes = props.bootSizes ?? [575, 767, 991, 1199, 1399, 1919];
  let sizes = props.sizes ?? bootSizes;
  let lazy = lazyLoad ?? false;

  const buildSrcSet = (imgList: any[]) => {
    return imgList.reduce((acc: string, cur: any, idx: number) => {
      return acc + cur.link + " " + (cur.width ? cur.width : "1400") + (idx === imgList.length - 1 ? "w" : "w, ");
    }, "");
  };

  const getDefaultImage = (imgList: any[]) => {
    return imgList.reduce((acc: any, cur: any) => {
      return acc === "" || (!defaultSize && cur.width! > acc.width!) || (defaultSize && cur.width === defaultSize) ? cur : acc;
    }, "");
  };

  let source = src.constructor.name === "Object" ? [src] : src;
  return source.constructor.name === "Array" ? (
    <img
      alt={title}
      className={imageClass}
      sizes={
        sizes.constructor.name === "Array"
          ? sizes?.map((size: string, index: number) => {
              return "(max-width: " + bootSizes[index].toString() + "px) " + size.toString() + "px";
            }) +
            ", " +
            (defaultSize ?? getDefaultImage(source).width) +
            "px"
          : sizes
      }
      {...(!lazy
        ? { srcSet: buildSrcSet(source), src: getDefaultImage(source).link }
        : {
            "data-srcset": buildSrcSet(source),
            "data-src": getDefaultImage(source).link,
          })}
    />
  ) : (
    <img
      alt={title}
      className={imageClass}
      onError={({ currentTarget }) => {
        currentTarget.onerror = null; /* prevents looping*/
        currentTarget.src = defaultImage;
      }}
      {...(!lazy ? { src: source } : { "data-src": source })}
    />
  );
};
