import { ReactComponent as Logo } from "./../assets/Logo.svg";
import { Language } from "./Language";

export const TopMenu = () => {
  return (
    <>
      <div className="top-menu">
        <div className="top-menu__container">
          <div className="top_menu__container__left">
            <div className="top_menu_container__left__logo-container">
              <div className="top_menu_container__left__logo-container__logo">
                <Logo />
              </div>
            </div>
          </div>
          <div className="top_menu__container__right">
            <div className="top_menu__container__right__language-container">
              <Language></Language>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
