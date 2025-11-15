import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Artigo, SearchResponseDto } from "./types";
import ArrowIcon from "../assets/images/png/arrow.png";
import { SearchStatisticsPage } from "./SearchStatisticsPage";

interface ArtigosProps {
  response: SearchResponseDto;
  setShow: Dispatch<SetStateAction<boolean>>;
}

export const ArticlesList = ({ response, setShow }: ArtigosProps) => {
  const { t } = useTranslation();
  const [artigos, setArtigos] = useState<Artigo[]>([]);
  const [paginaAtual, setPaginaAtual] = useState<number>(1);
  const [moreInfo, setMoreInfo] = useState<boolean>(false);
  const artigosPorPagina = 10;

  useEffect(() => {
    if (response && Array.isArray(response.articles)) {
      setArtigos(response.articles);
    } else {
      setArtigos([]);
    }
  }, [response]);

  const indexInicial = (paginaAtual - 1) * artigosPorPagina;
  const indexFinal = indexInicial + artigosPorPagina;
  const artigosVisiveis = artigos.slice(indexInicial, indexFinal);
  const totalPaginas = Math.ceil(artigos.length / artigosPorPagina);

  const gerarBotoesPaginacao = () => {
    const botoes: (number | string)[] = [];

    if (totalPaginas <= 7) {
      for (let i = 1; i <= totalPaginas; i++) botoes.push(i);
    } else {
      if (paginaAtual <= 4) {
        botoes.push(1, 2, 3, 4, 5, "...", totalPaginas);
      } else if (paginaAtual >= totalPaginas - 3) {
        botoes.push(
          1,
          "...",
          totalPaginas - 4,
          totalPaginas - 3,
          totalPaginas - 2,
          totalPaginas - 1,
          totalPaginas
        );
      } else {
        botoes.push(
          1,
          "...",
          paginaAtual - 1,
          paginaAtual,
          paginaAtual + 1,
          "...",
          totalPaginas
        );
      }
    }
    return botoes;
  };

  const mudarPagina = (p: number) => {
    if (p >= 1 && p <= totalPaginas) {
      setPaginaAtual(p);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="lista-artigos-page">
      <div className="lista-artigos-card">
        <div className="lista-artigos-card__rollback">
          <button
            className="lista-artigos-card__rollback__btn"
            onClick={() => setShow(false)}
          >
            <img src={ArrowIcon} alt="Voltar atrás" />
          </button>
        </div>

        <div className="header">
          <h2>{!moreInfo ? t("articles:titulo_lista") : "Metrics"}</h2>

        <div>
              <a
              href="/api/download"
              className="download-btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("articles:botao_download")}
            </a>

            <span
              hidden= {artigos.length < 1 }
              className="download-btn"
              onClick={() => setMoreInfo(!moreInfo)}
            >
              {!moreInfo ? "More info" : t("articles:titulo_lista")}
            </span>
          </div>
        </div>

      {moreInfo ? (<SearchStatisticsPage {... response}/>) : 
        (
        <>
          <div className="results-container">
              <div className="results-container__text">
                {response?.totalArticles ?? artigos.length} {t("home:results")}
                <br />
                {response?.duplicatedResultsRemoved > 0 && (
                  <>
                    {response.duplicatedResultsRemoved}{" "}
                    {t("home:duplicatedResultsRemoved")}
                  </>
                )}
              </div>
            </div><table>
                <thead>
                  <tr>
                    <th>{t("articles:coluna_titulo")}</th>
                    <th>{t("articles:coluna_autores")}</th>
                    <th>{t("articles:coluna_ano")}</th>
                    <th>{t("articles:coluna_venue")}</th>
                    <th>{t("articles:coluna_link")}</th>
                    <th>{t("articles:coluna_fonte")}</th>
                  </tr>
                </thead>
                <tbody>
                  {artigosVisiveis.map((artigo, index) => (
                    <tr key={index}>
                      <td>{artigo.title}</td>
                      <td>{artigo.authors}</td>
                      <td>{artigo.publicationYear}</td>
                      <td>{artigo.venue}</td>
                      <td>
                        <a
                          href={artigo.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {artigo.link}
                        </a>
                      </td>
                      <td>{artigo.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table><div className="pagination">
                <button
                  onClick={() => mudarPagina(paginaAtual - 1)}
                  disabled={paginaAtual === 1}
                >
                  &lt;
                </button>

                {gerarBotoesPaginacao().map((p, i) => p === "..." ? (
                  <span key={i} className="ellipsis">
                    ...
                  </span>
                ) : (
                  <button
                    key={i}
                    onClick={() => mudarPagina(p as number)}
                    className={p === paginaAtual ? "active" : ""}
                  >
                    {p}
                  </button>
                )
                )}

                <button
                  onClick={() => mudarPagina(paginaAtual + 1)}
                  disabled={paginaAtual === totalPaginas}
                >
                  &gt;
                </button>
              </div>
            </>
        )
       };
      </div>
    </div>
  );
};

//Lista que vai receber

// [
//     {
//         "title": "AI-Family Integration Index (AFII): Benchmarking a New Global Readiness for AI as Family",
//         "publicationYear": "2025",
//         "venue": "",
//         "venueType": "Unpublished",
//         "authors": "Mahajan, Prashant",
//         "link": "https://hal.science/hal-05020569",
//         "source": "HAL"
//     },
//     {
//         "title": "REVIEWING THE RISKS OF AI TECHNICAL DEBT (TD) IN THE FINANCIAL SERVICES INDUSTRIES (FSIS)",
//         "publicationYear": "2024",
//         "venue": "",
//         "venueType": "Unpublished",
//         "authors": "Sankarapu, Vinay Kumar",
//         "link": "https://hal.science/hal-04691168",
//         "source": "HAL"
//     }
// ]
