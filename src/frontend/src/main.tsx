import { createRoot } from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import { HashRouter } from "react-router-dom";
import { Routing } from "./routes/Routing.tsx";
import { store } from "./store";
import { I18nextProvider } from "react-i18next";
import i18n from "./assets/i18n";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <I18nextProvider i18n={i18n}>
      <HashRouter>
        <Routing />
      </HashRouter>
    </I18nextProvider>
  </Provider>
);
