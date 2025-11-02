package pt.isec.literaturereviewhelper.controllers;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.services.ApiService;
import pt.isec.literaturereviewhelper.models.Engines;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api")
public class LiteratureSearchController {
    private final ApiService apiService;

    public LiteratureSearchController(ApiService apiService) {
        this.apiService = apiService;
    }

    /**
     * Universal search endpoint that routes to different academic search engines.
     * Accepts dynamic parameters based on the source type.
     */
    @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<List<Article>> search(@RequestParam Map<String, String> allParams) {
        String sourceStr = allParams.get("source");

        if (sourceStr == null || sourceStr.isBlank()) {

            return Flux.fromArray(Engines.values())
                    .flatMap(engine -> apiService.search(engine, allParams))
                    .flatMap(Flux::fromIterable)
                    .collectList();
        }

        List<Engines> sources = Arrays.stream(sourceStr.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(s -> {
                    try {
                        return Engines.valueOf(s.toUpperCase());
                    }
                    catch (IllegalArgumentException e) {
                        throw new IllegalArgumentException("Unsupported source: " + s);
                    }
                }).toList();

        return Flux.fromIterable(sources)
                .flatMap(engine -> apiService.search(engine, allParams))
                .flatMap(Flux::fromIterable)
                .collectList();
    }
}
