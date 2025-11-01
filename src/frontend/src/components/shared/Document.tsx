import { CommonLink } from "./";
import { isMobile } from "../../utils";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { DocumentProps } from "./types";

export const Document = (props: DocumentProps) => {
  const { dateCol, document } = props;
  const { title, date, file, extension } = document;
  const [isMobile_, setIsMobile] = useState(false);
  const [dateTxt, setDateTxt] = useState(dateCol && date ? format(new Date(date), "dd-MM-yyyy") : "");

  //#region format data according to screen
  useEffect(() => {
    const handler = function resizeHandler() {
      setIsMobile(isMobile());
    };

    window.addEventListener("resize", handler);
    setIsMobile(isMobile());

    return () => {
      window.removeEventListener("resize", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (dateCol && date) {
      if (isMobile_) setDateTxt(format(new Date(date), "dd-MM-yyyy"));
      else setDateTxt(format(new Date(date), "dd - MM - yyyy"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile_]);
  //#endregion

  return (
    <CommonLink link={{ external: true, url: file }} linkClass="document__item" title={title}>
      <div className="document__type">{extension}</div>
      {dateCol && <p className="document__date">{date && date.length > 0 && dateTxt}</p>}
      <p className="document__name">
        <span>{title}</span>
      </p>
      <div className="document__download"></div>
    </CommonLink>
  );
};
