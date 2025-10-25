
package pt.isec.literaturereviewhelper.interfaces;

import java.util.List;
import java.util.Map;

import pt.isec.literaturereviewhelper.models.Article;
import reactor.core.publisher.Mono;

public interface ISearchEngine {

    /**
     * Performs a search with the given parameters
     * @param params Map of search parameters (query, pagination, API-specific params)
     * @return Mono containing list of articles
     */
    Mono<List<Article>> search(Map<String, Object> params);
    
    /**
     * Returns the name of this search engine
     * @return Engine name (e.g., "Springer", "HAL", "ACM")
     */
    String getEngineName();
}