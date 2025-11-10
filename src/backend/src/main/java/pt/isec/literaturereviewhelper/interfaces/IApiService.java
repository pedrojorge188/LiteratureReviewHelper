package pt.isec.literaturereviewhelper.interfaces;

import java.util.Map;

import pt.isec.literaturereviewhelper.dtos.SearchResultDto;
import pt.isec.literaturereviewhelper.models.Engines;
import reactor.core.publisher.Mono;

public interface IApiService {
    /**
     * Performs a search using the specified engine
     * 
     * @param engine The search engine to use (SPRINGER, HAL, ACM)
     * @param params Map of search parameters
     * @return Mono containing search results (articles and statistics)
     */
    Mono<SearchResultDto> search(Engines engine, Map<String, String> params);
}
