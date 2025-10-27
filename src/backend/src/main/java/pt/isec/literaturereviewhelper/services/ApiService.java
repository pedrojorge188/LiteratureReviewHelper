package pt.isec.literaturereviewhelper.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import pt.isec.literaturereviewhelper.interfaces.ISearchEngine;
import pt.isec.literaturereviewhelper.interfaces.ISearchEngineFactory;
import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.Engines;

import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Service
public class ApiService {
    private static final Logger log = LoggerFactory.getLogger(ApiService.class);
    private final ISearchEngineFactory factory;

    public ApiService(ISearchEngineFactory factory) {
        this.factory = factory;
    }

    /**
     * Performs a search using the specified engine
     * 
     * @param engine The search engine to use (SPRINGER, HAL, ACM)
     * @param params Map of search parameters
     * @return Mono containing list of articles
     */
    public Mono<List<Article>> search(Engines engine, Map<String, String> params) {
        ISearchEngine searchEngine = factory.createSearchEngine(engine);
        return searchEngine.search(params);
    }
}