package pt.isec.literaturereviewhelper.services;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import org.springframework.stereotype.Service;
import pt.isec.literaturereviewhelper.commons.Params;
import pt.isec.literaturereviewhelper.dtos.SearchResponseDto;
import pt.isec.literaturereviewhelper.filters.ResultFilterChain;
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
                        .map(listOfEntries -> {
                            List<Article> allArticles = new ArrayList<>();
                            int totalDropped = 0;
                            for (var entry : listOfEntries) {
                                allArticles.addAll(entry.getValue().getArticles());
                                Map<String, Map<IResultFilter.Statistic, Integer>> stats = entry.getValue().getStatistics();
                                if (stats != null && stats.containsKey("DuplicateResultFilter")) {
                                    int duplicates = stats.get("DuplicateResultFilter").getOrDefault(IResultFilter.Statistic.DROPPED, 0);
                                    totalDropped += duplicates;
                                }
                            }

                            DuplicateResultFilter Duplicatedfilter = new DuplicateResultFilter();
                            List<Article> filteredArticles = Duplicatedfilter.filter(allArticles);
                            totalDropped += Duplicatedfilter.getExecutionStatistics().get(IResultFilter.Statistic.DROPPED);

                            Map<Engines, Integer> articlesByEngineAfterFilter = new EnumMap<>(Engines.class);
                            for (Engines source : sources) {
                                articlesByEngineAfterFilter.put(source, 0);
                            }
                            System.out.println(articlesByEngineAfterFilter);
                            for (Article article : filteredArticles) {
                                articlesByEngineAfterFilter.merge(article.source(), 1, Integer::sum);
                            }

                            return new SearchResponseDto(query, filteredArticles.size(), articlesByEngineAfterFilter, filteredArticles, totalDropped);
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
