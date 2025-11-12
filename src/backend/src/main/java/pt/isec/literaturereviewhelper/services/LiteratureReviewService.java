package pt.isec.literaturereviewhelper.services;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import pt.isec.literaturereviewhelper.commons.Params;
import pt.isec.literaturereviewhelper.dtos.SearchResponseDto;
import pt.isec.literaturereviewhelper.interfaces.IApiService;
import pt.isec.literaturereviewhelper.interfaces.ILiteratureReviewService;
import pt.isec.literaturereviewhelper.interfaces.IResultFilter;
import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.Engines;
import reactor.core.publisher.Flux;
import pt.isec.literaturereviewhelper.filters.DuplicateResultFilter;
import reactor.core.publisher.Mono;

@Service
public class LiteratureReviewService implements ILiteratureReviewService {
    private final IApiService apiService;

    public LiteratureReviewService(IApiService apiService) {
        this.apiService = apiService;

    }

    @Override
    public Mono<SearchResponseDto> performLiteratureSearch(Map<String, String> allParams, Map<Engines, String> apiKeysByEngine) {
        String sourceStr = allParams.get("source");
        String query = allParams.getOrDefault("q", "");

        List<Engines> sources = parseSources(sourceStr);
        return Flux.fromIterable(sources)
                .flatMap(engine -> {
                    var key = apiKeysByEngine.get(engine);
                    if (key != null) {
                        allParams.put(Params.API_KEY, key);
                    }

                    return apiService.search(engine, allParams)
                        .map(searchResultDto -> Map.entry(engine, searchResultDto));})
                        .collectList()
                        .map(listOfEngines -> {
                            Map<Engines, Integer> articlesByEngine = new EnumMap<>(Engines.class);
                            List<Article> allArticles = new ArrayList<>();
                            int totalDropped = 0;
                            for (var entry : listOfEngines) {
                                articlesByEngine.put(entry.getKey(), entry.getValue().getArticles().size());
                                allArticles.addAll(entry.getValue().getArticles());
                                Map<String, Map<IResultFilter.Statistic, Integer>> stats = entry.getValue().getStatistics();
                                if (stats != null && stats.containsKey(DuplicateResultFilter.class.getSimpleName())) {
                                    int duplicates = stats.get(DuplicateResultFilter.class.getSimpleName()).getOrDefault(IResultFilter.Statistic.DROPPED, 0);
                                    totalDropped += duplicates;
                                }
                            }

                            DuplicateResultFilter filter = new DuplicateResultFilter();
                            List<Article> filteredArticles = filter.filter(allArticles);
                            totalDropped += filter.getExecutionStatistics().get(IResultFilter.Statistic.DROPPED);

                            return new SearchResponseDto(query, filteredArticles.size(), articlesByEngine, filteredArticles, totalDropped);
                        });
    }

    /**
     * Parses the "source" parameter and converts it into a list of Engines enums.
     *
     * If the sourceStr is null or blank, this method returns all available engines.
     * Otherwise, it splits the input string by commas, trims whitespace, converts each
     * engine name to uppercase, and maps it to the corresponding Engines enum.
     *
     * @param sourceStr the comma-separated string of engine names (e.g., "springer,hal,acm")
     * @return a List of Engines to be used for the search
     * @throws IllegalArgumentException if any engine name is invalid or not supported
     */
    private List<Engines> parseSources(String sourceStr) {
        if (sourceStr == null || sourceStr.isBlank()) {
            return Arrays.asList(Engines.values());
        }
        return Arrays.stream(sourceStr.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(s -> {
                    try {
                        return Engines.valueOf(s.toUpperCase());
                    } catch (IllegalArgumentException e) {
                        throw new IllegalArgumentException("Unsupported source: " + s);
                    }
                }).toList();
    }
}
