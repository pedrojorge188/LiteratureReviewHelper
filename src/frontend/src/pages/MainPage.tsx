import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getArticles } from "../store/ducks/home/thunks";
import { useDispatch } from "react-redux";
import { SearchResponseDto } from "./types";
import { ArticlesList } from "./ArticlesList";
import { LoadingCircle } from "../components/shared";

interface Query {
  valor: string;
  metadado?: string;
}

export const MainPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<any>();
  const [queries, setQueries] = useState<Query[]>([{ valor: "" }]);
  const [anoDe, setAnoDe] = useState<string>("");
  const [anoAte, setAnoAte] = useState<string>("");
  const [excluirVenues, setExcluirVenues] = useState<string>("");
  const [excluirTitulos, setExcluirTitulos] = useState<string>("");
  const [bibliotecaSelecionada, setBibliotecaSelecionada] =
    useState<string>("");
  const [bibliotecas, setBibliotecas] = useState<string[]>([]);
  const [showList, setShowList] = useState(false);
  const [response, setResponse] = useState<SearchResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const normalizarQueries = (lista: Query[]): Query[] => {
    return lista.map((q, i) => {
      if (i === 0) {
        const { valor } = q;
        return { valor };
      }
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
    console.log(t("home:dados_guardados"), {
      queries,
      anoDe,
      anoAte,
      excluirVenues,
      excluirTitulos,
      bibliotecas,
    });
  };

  const pesquisar = async () => {
    setIsLoading(true);
    const queryString = queries
      .map((q, i) => (i === 0 ? q.valor : `${q.metadado} ${q.valor}`))
      .join(" ");

    try {
      const resultAction = await dispatch(
        getArticles({
          query: queryString,
          apiList: "SPRINGER=0c2c20ce9ca00510e69e0bd7ffba864e",
        })
      );

      if (getArticles.fulfilled.match(resultAction)) {
        setResponse(resultAction.payload as SearchResponseDto);
        setShowList(true);
      } else {
        console.error("Erro na pesquisa:", resultAction.error);
      }
    } catch (error) {
      console.error("Erro geral na pesquisa:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {}, [showList]);

  return (
    <>
      {isLoading && <LoadingCircle />}

      <div
        className={`container-article ${showList && article ? "show" : "hide"}`}
      >
        {article && <ArticlesList lista={article} setShow={setShowList} />}
      </div>

      <div
        className={`pesquisa-container ${
          showList && article ? "hide-pesquisa" : ""
        }`}
      >
        <h2>{t("home:titulo_pesquisa")}</h2>

        <div className="pesquisa-container__content">
          {/* Query Section */}
          <div className="section">
            <label>{t("home:label_query")}</label>
            {queries.map((q, index) => (
              <div key={index} className="query-row">
                {index > 0 && (
                  <select
                    value={q.metadado}
                    onChange={(e) =>
                      atualizarQuery(index, "metadado", e.target.value)
                    }
                  >
                    <option value="AND">{t("home:operador_and")}</option>
                    <option value="OR">{t("home:operador_or")}</option>
                    <option value="NOT">{t("home:operador_not")}</option>
                  </select>
                )}

                <input
                  className="query-row__input-text"
                  type="text"
                  value={q.valor}
                  placeholder={t("home:placeholder_query") ?? ""}
                  onChange={(e) =>
                    atualizarQuery(index, "valor", e.target.value)
                  }
                />

                <div className="query-buttons">
                  {index === queries.length - 1 && (
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={adicionarQuery}
                      title={t("home:adicionar_query") ?? ""}
                    >
                      &#65291;
                    </button>
                  )}
                  {index > 0 && (
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => moverQueryCima(index)}
                      title={t("home:mover_para_cima") ?? ""}
                    >
                      &#8593;
                    </button>
                  )}
                  {index > 0 && (
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => removerQuery(index)}
                      title={t("home:remover_query") ?? ""}
                    >
                      &#10005;
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div className="container-bts">
              <button type="button" onClick={() => {}}>
                Importar Querie
              </button>
              <button type="button" onClick={() => {}}>
                Importar Ficheiro
              </button>
            </div>
          </div>

          {/* Ano de publicação */}
          <div className="section">
            <label>{t("home:label_ano_publicacao")}</label>
            <div className="ano-row">
              <select value={anoDe} onChange={(e) => setAnoDe(e.target.value)}>
                <option value="">{t("home:ano_de")}</option>
                {Array.from({ length: 30 }, (_, i) => 2025 - i).map((ano) => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
              </select>

              <select
                value={anoAte}
                onChange={(e) => setAnoAte(e.target.value)}
              >
                <option value="">{t("home:ano_ate")}</option>
                {Array.from({ length: 30 }, (_, i) => 2025 - i).map((ano) => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Excluir venues */}
          <div className="section">
            <label>{t("home:label_excluir_venues")}</label>
            <textarea
              value={excluirVenues}
              onChange={(e) => setExcluirVenues(e.target.value)}
              placeholder={t("home:placeholder_excluir_venues") ?? ""}
            ></textarea>
            <div className="container-bts">
              <button type="button" onClick={() => {}}>
                Importar Venues
              </button>
              <button type="button" onClick={() => {}}>
                Importar Ficheiro
              </button>
            </div>
          </div>

          {/* Excluir títulos */}
          <div className="section">
            <label>{t("home:label_excluir_titulos")}</label>
            <textarea
              value={excluirTitulos}
              onChange={(e) => setExcluirTitulos(e.target.value)}
              placeholder={t("home:placeholder_excluir_titulos") ?? ""}
            ></textarea>
            <div className="container-bts">
              <button type="button" onClick={() => {}}>
                Importar Titulos
              </button>
              <button type="button" onClick={() => {}}>
                Importar Ficheiro
              </button>
            </div>
          </div>

          {/* Bibliotecas */}
          <div className="section">
            <label>{t("home:label_bibliotecas")}</label>
            <div className="biblioteca-row">
              <select
                value={bibliotecaSelecionada}
                onChange={(e) => setBibliotecaSelecionada(e.target.value)}
              >
                <option value="">{t("home:selecionar_biblioteca")}</option>
                <option value="Scopus">Scopus</option>
                <option value="ACM">ACM</option>
                <option value="DBLP">DBLP</option>
              </select>
              <button type="button" onClick={adicionarBiblioteca}>
                {t("home:botao_adicionar")}
              </button>
            </div>

            <h3 className="bibliotecas-lista-titulo">
              {t("home:lista_bibliotecas")}
            </h3>
            <ul className="bibliotecas-lista">
              {bibliotecas.map((b, i) => (
                <li key={i}>
                  <span>{b}</span>
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removerBiblioteca(b)}
                  >
                    {t("home:botao_remover")}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Botões principais */}
          <div className="actions">
            <button type="button" onClick={guardar}>
              {t("home:botao_guardar")}
            </button>
            <button type="button" onClick={pesquisar}>
              {t("home:botao_pesquisar")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
