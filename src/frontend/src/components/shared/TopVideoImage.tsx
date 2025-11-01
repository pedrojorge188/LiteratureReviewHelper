import { CommonImage } from "./CommonImage";
import { ITopVideoImage } from "./types";

export const TopVideoImage = ({ topVideo, topImage, title, topImageTitle }: ITopVideoImage) => {
  let videoId = "";
  if (topVideo?.contentType?.includes("youtube")) {
    const videoUrl = topVideo?.content!;
    videoId = videoUrl.replace(/^https:\/\/www.youtube.com\/embed\//, "");
  }

  return (
    <>
      {topVideo && topVideo.content ? (
        topVideo.contentType && topVideo.contentType.includes("mp4") ? (
          <video className="top-multimedia--video" autoPlay loop muted playsInline>
            <source src={topVideo.content} />
          </video>
        ) : (
          <iframe
            className="top-multimedia--video"
            src={topVideo.content + `?loop=1&autoplay=1&playsinline=1&mute=1&controls=0&playlist=${videoId}`}
            title={title}
            allow="autoplay; playsinline; loop"
          ></iframe>
        )
      ) : (
        topImage &&
        topImage.length > 0 && (
          <div className="top-multimedia--image margin-top--generic">
            <CommonImage imageClass="img--generic" src={topImage} title={topImageTitle} />
          </div>
        )
      )}
    </>
  );
};
