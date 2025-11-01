package pt.isec.literaturereviewhelper.interfaces;

import pt.isec.literaturereviewhelper.models.Article;

import java.util.List;
import java.util.Map;

import reactor.core.publisher.Mono;

public interface ISearchEngine {

    /**
     * Performs a search with the given parameters
     * @param params Map of search parameters (query, pagination, API-specific params)
     * @return Mono containing list of articles
     */
    Mono<List<Article>> search(Map<String, String> params);

    /**
     * Maps raw parameters to API parameters
     * @param raw Parameters passed on the query
     * @return Parameters needed for the API
     */
    Map<String, Object> mapParams(Map<String, String> raw);

    /**
     * Returns the name of this search engine
     * @return Engine name (e.g., "Springer", "HAL", "ACM")
     */
    String getEngineName();
}