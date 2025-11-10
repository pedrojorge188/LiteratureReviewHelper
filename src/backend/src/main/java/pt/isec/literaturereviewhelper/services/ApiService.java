package pt.isec.literaturereviewhelper.services;

import org.springframework.stereotype.Service;

import pt.isec.literaturereviewhelper.dtos.SearchResultDto;
import pt.isec.literaturereviewhelper.interfaces.IApiService;
import pt.isec.literaturereviewhelper.interfaces.ISearchEngine;
import pt.isec.literaturereviewhelper.interfaces.ISearchEngineFactory;
import pt.isec.literaturereviewhelper.models.Engines;

import reactor.core.publisher.Mono;

import java.util.Map;

@Service
public class ApiService implements IApiService {
    private final ISearchEngineFactory factory;

    public ApiService(ISearchEngineFactory factory) {
        this.factory = factory;
    }

    /**
     * Performs a search using the specified engine
     * 
     * @param engine The search engine to use (SPRINGER, HAL, ACM)
     * @param params Map of search parameters
     * @return Mono containing search results (articles and statistics)
     */
    @Override
    public Mono<SearchResultDto> search(Engines engine, Map<String, String> params) {
        ISearchEngine searchEngine = factory.createSearchEngine(engine);
        return searchEngine.search(params);
    }
}