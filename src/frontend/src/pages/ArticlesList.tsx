import { useEffect, useState } from "react";

interface Artigo {
  titulo: string;
  autores: string;
  ano: number;
  venue: string;
  tipo: string;
  fonte: string;
}

export const ArticlesList = () => {
  const [artigos, setArtigos] = useState<Artigo[]>([]);
  const [paginaAtual, setPaginaAtual] = useState<number>(1);
  const artigosPorPagina = 10;

  // Gerar um JSON dummy com 50 artigos
  useEffect(() => {
    const dummy: Artigo[] = Array.from({ length: 50 }, (_, i) => ({
      titulo: `(Texto Abreviado ${i + 1})`,
      autores: `(Texto Abreviado ${i + 1})`,
      ano: 2025,
      venue: "Journal",
      tipo: "Information Systems",
      fonte: i % 2 === 0 ? "ScienceDirect" : "ACM",
    }));
    setArtigos(dummy);
  }, []);

  // Calcular indices da paginação
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
      <div className="breadcrumb">
        <a href="#">Início</a> &gt; <a href="#">Criar Estado de Arte</a> &gt;{" "}
        <span>Lista de Artigos</span>
      </div>

      <div className="lista-artigos-card">
        <div className="header">
          <h2>Lista de Artigos</h2>
          <a
            href="/api/download"
            className="download-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download
          </a>
        </div>

        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Autores</th>
              <th>Ano</th>
              <th>Venue</th>
              <th>Tipo</th>
              <th>Fonte</th>
            </tr>
          </thead>
          <tbody>
            {artigosVisiveis.map((artigo, index) => (
              <tr key={index}>
                <td>{artigo.titulo}</td>
                <td>{artigo.autores}</td>
                <td>{artigo.ano}</td>
                <td>{artigo.venue}</td>
                <td>{artigo.tipo}</td>
                <td>{artigo.fonte}</td>
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
