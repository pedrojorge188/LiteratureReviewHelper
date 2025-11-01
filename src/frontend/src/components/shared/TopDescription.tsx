import { useEffect, useState } from "react";
import { ITopDescription } from "./types";

export const TopDescription = (props: ITopDescription) => {
  const { topDescription, subtitle, variant = "" } = props;
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (subtitle !== undefined && topDescription !== undefined) setShow(true);
    else if (subtitle !== undefined) setShow(true);
    else if (topDescription !== undefined) setShow(true);
    else setShow(false);
  }, [topDescription, subtitle]);

  return (
    <>
      {show && (
        <section id="topDescription" className={"margin-bottom__top-description " + variant}>
          <div className="margin-top--generic">
            {subtitle && <div className="description--subtitle">{subtitle}</div>}
            {topDescription && (
              <div
                dangerouslySetInnerHTML={{
                  __html: topDescription,
                }}
                className="description--generic text-indent"
              ></div>
            )}
          </div>
        </section>
      )}
    </>
  );
};
