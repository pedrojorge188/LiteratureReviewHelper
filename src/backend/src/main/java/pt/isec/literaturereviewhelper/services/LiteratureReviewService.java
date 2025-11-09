package pt.isec.literaturereviewhelper.services;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap; // Import ConcurrentHashMap
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.stereotype.Service;

import pt.isec.literaturereviewhelper.commons.Params;
import pt.isec.literaturereviewhelper.dtos.SearchResponseDto;
import pt.isec.literaturereviewhelper.interfaces.IApiService;
import pt.isec.literaturereviewhelper.interfaces.ILiteratureReviewService;
import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.Engines;
import reactor.core.publisher.Flux;
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
                            .flatMapMany(Flux::fromIterable)
                            .collectList()
                            .map(articles -> Map.entry(engine, articles));
                })
                .collectList()
                .map(listOfEntries -> {
                    Map<Engines, Integer> articlesByEngine = new EnumMap<>(Engines.class);
                    Map<String, Article> uniqueArticlesMap = new ConcurrentHashMap<>();
                    AtomicInteger articlesDuplicatedRemoved = new AtomicInteger(0);

                    listOfEntries.parallelStream().forEach(entry -> {
                        articlesByEngine.put(entry.getKey(), entry.getValue().size());
                        entry.getValue().parallelStream().forEach(article -> {
                            String originalTitle = article.title();
                            String processedTitle = getProcessedTitle(originalTitle);
                            if (uniqueArticlesMap.putIfAbsent(processedTitle, article) != null) {
                                articlesDuplicatedRemoved.incrementAndGet();
                            }
                        });
                    });

                    List<Article> allArticles = new ArrayList<>(uniqueArticlesMap.values());
                    int totalArticles = allArticles.size();

                    return new SearchResponseDto(query, totalArticles, articlesByEngine, allArticles, articlesDuplicatedRemoved.get());
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

    /**
     * Processes an article title by converting it to lowercase and removing special characters.
     * This is used for removing duplication purposes.
     *
     * @param title The original article title.
     * @return The processed title.
     */
    private String getProcessedTitle(String title) {
        if (title == null) {
            return "";
        }
        return title.toLowerCase().replaceAll("[!@#$%^&*()_+\\-=\\[\\]{};:'\",.<>?/~`|\\\\]+", "");
    }
}
