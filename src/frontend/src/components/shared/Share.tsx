import { useState } from "react";
import { Popover, PopoverBody } from "reactstrap";
import { t } from "i18next";
import { ShareProps } from "./types";

export const Share = (props: ShareProps) => {
  const data = props;
  const print = t("general:print");
  let share = t("general:share");
  let shareBy = t("general:share", { context: "by" });
  let shareOn = t("general:share", { context: "on" });
  let moreOptions = t("general:moreOptions");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);

  function sharebarBtnsShow() {
    setIsOpen(!isOpen);
  }

  function openURLInPopup(url: string, width: number = 800, height: number = 600) {
    let top = window.outerHeight / 2 + window.screenY - height / 2;
    let left = window.outerWidth / 2 + window.screenX - width / 2;
    let newwindow = window.open(
      url,
      "window" + Math.floor(Math.random() * 10000 + 1),
      "location,status,scrollbars,resizable,width=" + width + ",height=" + height + ",top=" + top + ",left=" + left
    );
    newwindow?.focus();
  }

  function copyTextToClipboard(text: string, successCallback: Function) {
    navigator.clipboard.writeText(text).then(
      () => {
        successCallback();
      },
      (err) => {
        console.error("Async: Could not copy text: ", err);
      }
    );
  }

  function sharebarBtnClick(option: string) {
    const tempUrl = window.location.href;
    const metaTitle: any = document.querySelector('meta[property="og:title"]');
    const tempTitle = metaTitle ? metaTitle.content : document.getElementsByTagName("title")[0].innerHTML;

    if (option === "mail") window.location.href = "mailto:?body=" + encodeURIComponent(tempUrl) + "&subject=" + tempTitle;
    else if (option === "print") window.print();
    else if (option === "fb") {
      const url =
        "https://www.facebook.com/sharer/sharer.php?kid_directed_site=0&u=" + encodeURIComponent(tempUrl) + "&display=popup&ref=plugin&src=share_button";
      openURLInPopup(url, 800, 300);
    } else if (option === "wapp") {
      const url = "https://wa.me/?text=" + encodeURIComponent(tempUrl);
      openURLInPopup(url, 800, 300);
    } else if (option === "tw") {
      const url = "https://twitter.com/share?url=" + encodeURIComponent(tempUrl) + "&text=" + tempTitle;
      openURLInPopup(url, 800, 450);
    } else if (option === "in") {
      const url = "https://www.linkedin.com/shareArticle?mini=true&url=" + encodeURIComponent(tempUrl) + "&title=" + tempTitle;
      openURLInPopup(url, 800, 450);
    } else if (option === "url") {
      copyTextToClipboard(tempUrl, () => {
        setPopoverOpen(true);
        setTimeout(() => {
          setPopoverOpen(false);
        }, 2000);
      });
    }
  }

  return (
    <section className={data.class ? data.class : ""}>
      <div className="sharebar">
        <div className="wrapper">
          <div className="sharebar__container">
            <h2 id="sharebar-title" className="sharebar__title">
              {share}
            </h2>
            <ul className="sharebar__links-container" aria-labelledby="sharebar-title">
              <li>
                <button
                  onClick={() => {
                    sharebarBtnClick("fb");
                  }}
                  className="btn-social"
                  title={`${shareOn} Facebook`}
                  aria-label={`${shareOn} Facebook`}
                >
                  <span className="fab fa-facebook-f"></span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    sharebarBtnClick("tw");
                  }}
                  className="btn-social"
                  title={`${shareOn} Twitter`}
                  aria-label={`${shareOn} Twitter`}
                >
                  <span className="fab fa-twitter"></span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    sharebarBtnClick("in");
                  }}
                  className="btn-social"
                  title={`${shareOn} Linkedin`}
                  aria-label={`${shareOn} Linkedin`}
                >
                  <span className="fab fa-linkedin-in"></span>
                </button>
              </li>
              <li>
                <button
                  className={"btn-social btn-social-collapse " + (isOpen ? "btn-social--inactive" : "")}
                  title={moreOptions}
                  onClick={sharebarBtnsShow}
                  aria-label={moreOptions}
                  aria-expanded={isOpen}
                >
                  <span className="far fa-ellipsis-h"></span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    sharebarBtnClick("wapp");
                  }}
                  className={"btn-social " + (isOpen ? "" : "btn-social--inactive")}
                  title={`${shareOn} WhatsApp`}
                  aria-label={`${shareOn} WhatsApp`}
                  aria-hidden={!isOpen}
                >
                  <span className="fab fa-whatsapp"></span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    sharebarBtnClick("url");
                  }}
                  id="btnSocialLink"
                  className={"btn-social " + (isOpen ? "" : "btn-social--inactive")}
                  title={`${share} link`}
                  aria-label={`${shareOn} link`}
                  aria-hidden={!isOpen}
                >
                  <span className="far fa-link"></span>
                  <Popover placement="bottom" isOpen={popoverOpen} target="btnSocialLink">
                    <PopoverBody>
                      <>{t("general:linkClipboard")}</>
                    </PopoverBody>
                  </Popover>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    sharebarBtnClick("mail");
                  }}
                  className={"btn-social " + (isOpen ? "" : "btn-social--inactive")}
                  title={`${shareBy} email`}
                  aria-label={`${shareOn} email`}
                  aria-hidden={!isOpen}
                >
                  <span className="fas fa-envelope"></span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    sharebarBtnClick("print");
                  }}
                  className={"btn-social " + (isOpen ? "" : "btn-social--inactive")}
                  title={print}
                  aria-label={print}
                  aria-hidden={!isOpen}
                >
                  <span className="fas fa-print"></span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
