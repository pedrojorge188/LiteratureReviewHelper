import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface Artigo {
  title: string;
  authors: string;
  publicationYear: number;
  venue: string;
  link: string;
  source: string;
}

//     {
//         "title": "REVIEWING THE RISKS OF AI TECHNICAL DEBT (TD) IN THE FINANCIAL SERVICES INDUSTRIES (FSIS)",
//         "publicationYear": "2024",
//         "venue": "",
//         "venueType": "Unpublished",
//         "authors": "Sankarapu, Vinay Kumar",
//         "link": "https://hal.science/hal-04691168",
//         "source": "HAL"
//     }

export const ArticlesList = () => {
  const { t } = useTranslation();
  const [artigos, setArtigos] = useState<Artigo[]>([]);
  const [paginaAtual, setPaginaAtual] = useState<number>(1);
  const artigosPorPagina = 10;

  // Gerar um JSON dummy com 50 artigos
  useEffect(() => {
    const dummy: Artigo[] = Array.from({ length: 50 }, (_, i) => ({
      title: `${t("articles:dummy_titulo")} ${i + 1}`,
      authors: `${t("articles:dummy_autores")} ${i + 1}`,
      publicationYear: 2025,
      venue: "Journal",
      link: `https://eusouumlink${i}.com`,
      source: i % 2 === 0 ? "ScienceDirect" : "ACM",
    }));
    setArtigos(dummy);
  }, [t]);

  // Calcular índices da paginação
  const indexInicial = (paginaAtual - 1) * artigosPorPagina;
  const indexFinal = indexInicial + artigosPorPagina;
  const artigosVisiveis = artigos.slice(indexInicial, indexFinal);
  const totalPaginas = Math.ceil(artigos.length / artigosPorPagina);

  // Renderização de paginação com elipses (... 1 2 ... 10 11)
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
        <div className="header">
          <h2>{t("articles:titulo_lista")}</h2>
          <a
            href="/api/download"
            className="download-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("articles:botao_download")}
          </a>
        </div>

        <table>
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
                <td>{artigo.link}</td>
                <td>{artigo.source}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button
            onClick={() => mudarPagina(paginaAtual - 1)}
            disabled={paginaAtual === 1}
          >
            &lt;
          </button>

          {gerarBotoesPaginacao().map((p, i) =>
            p === "..." ? (
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
