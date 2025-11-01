import { useEffect, useState } from "react";

export const useResizeWidth = (): boolean => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleWindowResize = (): void => {
      setWindowWidth(window.innerWidth);
    };

    const handleMobileCheck = (): void => {
      if (windowWidth < 992) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    window.addEventListener("resize", handleWindowResize);
    handleMobileCheck();

    return (): void => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [windowWidth]);

  return isMobile;
};
