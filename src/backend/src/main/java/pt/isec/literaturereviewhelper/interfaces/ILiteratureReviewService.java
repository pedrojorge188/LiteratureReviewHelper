package pt.isec.literaturereviewhelper.interfaces;

import java.util.Map;

import pt.isec.literaturereviewhelper.dtos.SearchResponseDto;
import pt.isec.literaturereviewhelper.models.Engines;
import reactor.core.publisher.Mono;

public interface ILiteratureReviewService {
    /**
     * Performs a literature review search across multiple search engines.
     *
     * This method executes searches using the specified API keys for each engine,
     * aggregates the results, counts the number of articles returned per engine,
     * and calculates the total number of articles found. The search parameters can
     * include query terms, filters, and other engine-specific options.
     *
     * @param allParams Map of search parameters, such as:
     *                  - "q": the search query
     *                  - "source": optional, comma-separated list of engines to search
     *                  - other engine-specific parameters
     * @param apiKeysByEngine Map associating each search engine (Engines enum) with its API key.
     *                        Each engine in the search should have a corresponding key here.
     * @return a Mono containing a SearchResponseDto, which includes:
     *         - the executed query,
     *         - the list of engines used,
     *         - total number of articles found,
     *         - a map specifying the number of articles returned per engine
     */
    Mono<SearchResponseDto> performLiteratureSearch(Map<String,String> allParams, Map<Engines,String> apiKeysByEngine);
}