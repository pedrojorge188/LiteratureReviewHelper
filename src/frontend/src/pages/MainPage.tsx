import { useState } from "react";

interface Query {
  valor: string;
  metadado?: string; // opcional no primeiro
}

export const MainPage = () => {
  const [queries, setQueries] = useState<Query[]>([{ valor: "" }]);
  const [anoDe, setAnoDe] = useState<string>("");
  const [anoAte, setAnoAte] = useState<string>("");
  const [excluirVenues, setExcluirVenues] = useState<string>("");
  const [excluirTitulos, setExcluirTitulos] = useState<string>("");
  const [bibliotecaSelecionada, setBibliotecaSelecionada] =
    useState<string>("");
  const [bibliotecas, setBibliotecas] = useState<string[]>([]);

  // 🧩 Função auxiliar que garante que apenas o primeiro não tem metadado
  const normalizarQueries = (lista: Query[]): Query[] => {
    return lista.map((q, i) => {
      if (i === 0) {
        const { valor } = q;
        return { valor }; // remove metadado
      }
      // se não tiver metadado, define um por defeito (ex: AND)
      return { valor: q.valor, metadado: q.metadado || "AND" };
    });
  };

  const adicionarQuery = () => {
    const nova = [...queries, { valor: "", metadado: "AND" }];
    setQueries(normalizarQueries(nova));
  };

  const removerQuery = (index: number) => {
    const nova = queries.filter((_, i) => i !== index);
    setQueries(normalizarQueries(nova));
  };

  const moverQueryCima = (index: number) => {
    if (index === 0) return;
    const novaLista = [...queries];
    [novaLista[index - 1], novaLista[index]] = [
      novaLista[index],
      novaLista[index - 1],
    ];
    setQueries(normalizarQueries(novaLista));
  };

  const atualizarQuery = (index: number, campo: keyof Query, valor: string) => {
    const novaLista = [...queries];
    novaLista[index][campo] = valor;
    setQueries(normalizarQueries(novaLista));
  };

  const adicionarBiblioteca = () => {
    if (bibliotecaSelecionada && !bibliotecas.includes(bibliotecaSelecionada)) {
      setBibliotecas([...bibliotecas, bibliotecaSelecionada]);
      setBibliotecaSelecionada("");
    }
  };

  const removerBiblioteca = (nome: string) => {
    setBibliotecas(bibliotecas.filter((b) => b !== nome));
  };

  const guardar = () => {
    console.log("Dados guardados:", {
      queries,
      anoDe,
      anoAte,
      excluirVenues,
      excluirTitulos,
      bibliotecas,
    });
  };

  const pesquisar = () => {
    // Exemplo de string resultante
    const queryString = queries
      .map((q, i) => (i === 0 ? q.valor : `${q.metadado} ${q.valor}`))
      .join(" ");
    console.log("Pesquisar com:", {
      queryString,
      queries,
      anoDe,
      anoAte,
      excluirVenues,
      bibliotecas,
    });
  };

  return (
    <div className="pesquisa-container">
      <h2>Pesquisa</h2>
      <div className="pesquisa-container__content">
        <div className="section">
          <label>Query</label>
          {queries.map((q, index) => (
            <div key={index} className="query-row">
              {/* Só mostra o seletor de operador se não for a primeira */}
              {index > 0 && (
                <select
                  value={q.metadado}
                  onChange={(e) =>
                    atualizarQuery(index, "metadado", e.target.value)
                  }
                >
                  <option value="AND">AND</option>
                  <option value="OR">OR</option>
                  <option value="NOT">NOT</option>
                </select>
              )}

              <input
                className="query-row__input-text"
                type="text"
                value={q.valor}
                onChange={(e) => atualizarQuery(index, "valor", e.target.value)}
              />

              <div className="query-buttons">
                {index === queries.length - 1 && (
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={adicionarQuery}
                    title="Adicionar nova query"
                  >
                    &#65291;
                  </button>
                )}
                {index > 0 && (
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => moverQueryCima(index)}
                    title="Mover para cima"
                  >
                    &#8593;
                  </button>
                )}
                {index > 0 && (
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => removerQuery(index)}
                    title="Remover"
                  >
                    &#10005;
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* As outras seções permanecem iguais */}
        <div className="section">
          <label>Ano Publicação</label>
          <div className="ano-row">
            <select value={anoDe} onChange={(e) => setAnoDe(e.target.value)}>
              <option value="">De</option>
              {Array.from({ length: 30 }, (_, i) => 2025 - i).map((ano) => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>
            <select value={anoAte} onChange={(e) => setAnoAte(e.target.value)}>
              <option value="">Até</option>
              {Array.from({ length: 30 }, (_, i) => 2025 - i).map((ano) => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="section">
          <label>Excluir Venues</label>
          <textarea
            value={excluirVenues}
            onChange={(e) => setExcluirVenues(e.target.value)}
            placeholder="Utilize ; para separar as tags de exclusão"
          ></textarea>
        </div>

        <div className="section">
          <label>Excluir Títulos</label>
          <textarea
            value={excluirTitulos}
            onChange={(e) => setExcluirTitulos(e.target.value)}
            placeholder="Utilize ; para separar as tags de exclusão"
          ></textarea>
        </div>

        <div className="section">
          <label>Bibliotecas</label>
          <div className="biblioteca-row">
            <select
              value={bibliotecaSelecionada}
              onChange={(e) => setBibliotecaSelecionada(e.target.value)}
            >
              <option value="">Selecionar Biblioteca</option>
              <option value="Scopus">Scopus</option>
              <option value="ACM">ACM</option>
              <option value="DBLP">DBLP</option>
            </select>
            <button type="button" onClick={adicionarBiblioteca}>
              Adicionar
            </button>
          </div>

          <h3 className="bibliotecas-lista-titulo">Lista de Bibliotecas</h3>
          <ul className="bibliotecas-lista">
            {bibliotecas.map((b, i) => (
              <li key={i}>
                <span>{b}</span>
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removerBiblioteca(b)}
                >
                  Remover
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="actions">
          <button type="button" onClick={guardar}>
            Guardar
          </button>
          <button type="button" onClick={pesquisar}>
            Pesquisar
          </button>
        </div>
      </div>
    </div>
  );
};
