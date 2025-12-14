import { Language } from "./Language";

export const TopMenu = () => {
  return (
    <>
      <div className="top-menu">
        <div className="top-menu__container">
          <div className="top-menu__container__left">
            <div className="top-menu_container__left__logo-container">
              <div className="top-menu__container__left__logo-container__logo">
                <img src="/Logo.png" alt="Logo" />
              </div>
            </div>
          </div>
          <div className="top-menu__container__right">
            <div className="top-menu__container__right__language-container">
              <Language></Language>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
