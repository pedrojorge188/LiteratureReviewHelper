import { t } from "i18next";

export const LibrariesPage = () => {
  const bibliotecas = ["HAL", "ACM", "SPRINGER"];

  return (
    <>
      <div className="pagina-bibliotecas">
        <div className="section">
          <label>{t("home:label_bibliotecas")}</label>
          <h3 className="bibliotecas-lista-titulo">{t("home:lista_bibliotecas")}</h3>
          <ul className="bibliotecas-lista">
            {bibliotecas.map((b, i) => (
              <li key={i}>
                <span>{b}</span>
                <button type="button" className="remove-btn" onClick={() => {}}>
                  detalhes
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};
