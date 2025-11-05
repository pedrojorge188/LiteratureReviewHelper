package pt.isec.literaturereviewhelper.interfaces;

import java.util.List;
import java.util.Map;

import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.Engines;
import reactor.core.publisher.Mono;

public interface IApiService {
    /**
     * Performs a search using the specified engine
     * 
     * @param engine The search engine to use (SPRINGER, HAL, ACM)
     * @param params Map of search parameters
     * @return Mono containing list of articles
     */
    Mono<List<Article>> search(Engines engine, Map<String, String> params);
}
