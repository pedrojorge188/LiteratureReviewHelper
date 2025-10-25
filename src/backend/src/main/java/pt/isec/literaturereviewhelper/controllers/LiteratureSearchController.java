package pt.isec.literaturereviewhelper.controllers;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.services.ApiService;
import pt.isec.literaturereviewhelper.models.Engines;
import reactor.core.publisher.Mono;

import java.util.HashMap;
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
     * 
     * Common parameters:
     * - source: The search engine to use (springer, hal, acm)
     * - q: The search query
     * - start: Starting index for pagination
     * - rows: Number of results to return
     * 
     * Source-specific parameters are passed through and validated per source.
     */
    @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<List<Article>> search(@RequestParam Map<String, String> allParams) {
        
        // Validate and parse source parameter
        String sourceStr = allParams.get("source");
        if (sourceStr == null || sourceStr.isBlank()) {
            throw new IllegalArgumentException("Parameter 'source' is required and cannot be empty");
        }

        Engines source;
        try {
            source = Engines.valueOf(sourceStr.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unsupported source: " + sourceStr + ". Supported sources: " + 
                    String.join(", ", java.util.Arrays.stream(Engines.values())
                            .map(Enum::name)
                            .map(String::toLowerCase)
                            .toArray(String[]::new)));
        }

        // Build engine-specific parameters
        Map<String, Object> params = buildEngineParams(source, allParams);

        // Delegate to the appropriate engine via ApiService facade
        return apiService.search(source, params);
    }

    /**
     * Builds parameter map specific to each search engine
     */
    private Map<String, Object> buildEngineParams(Engines engine, Map<String, String> allParams) {
        Map<String, Object> params = new HashMap<>();
        
        switch (engine) {
            case SPRINGER -> {
                validateRequiredParams(allParams, "q", "start", "rows", "api_key");
                // Map generic params to Springer-specific param names
                params.put("q", allParams.get("q"));
                params.put("s", parseInteger(allParams.get("start"), "start"));
                params.put("p", parseInteger(allParams.get("rows"), "rows"));
                params.put("api_key", allParams.get("api_key"));
                // Add any additional parameters
                addAdditionalParams(params, allParams, "source", "q", "start", "rows", "api_key");
            }
            case HAL -> {
                validateRequiredParams(allParams, "q", "start", "rows", "wt");
                // HAL uses standard param names
                params.put("q", allParams.get("q"));
                params.put("start", parseInteger(allParams.get("start"), "start"));
                params.put("rows", parseInteger(allParams.get("rows"), "rows"));
                params.put("wt", allParams.get("wt"));
                addAdditionalParams(params, allParams, "source", "q", "start", "rows", "wt");
            }
            case ACM -> {
                validateRequiredParams(allParams, "q", "start", "rows");
                // Map generic params to ACM/Crossref-specific param names
                params.put("query.bibliographic", allParams.get("q"));
                params.put("offset", parseInteger(allParams.get("start"), "start"));
                params.put("rows", parseInteger(allParams.get("rows"), "rows"));
                // Filter is optional
                if (allParams.containsKey("filter")) {
                    params.put("filter", allParams.get("filter"));
                }
                addAdditionalParams(params, allParams, "source", "q", "start", "rows", "filter");
            }
        }
        
        return params;
    }

    /**
     * Adds any additional parameters that weren't explicitly handled
     */
    private void addAdditionalParams(Map<String, Object> params, Map<String, String> allParams, String... excludeKeys) {
        List<String> excludeList = List.of(excludeKeys);
        allParams.forEach((key, value) -> {
            if (!excludeList.contains(key)) {
                params.put(key, value);
            }
        });
    }

    /**
     * Validates that required parameters are present and not blank
     */
    private void validateRequiredParams(Map<String, String> params, String... requiredKeys) {
        for (String key : requiredKeys) {
            String value = params.get(key);
            if (value == null || value.isBlank()) {
                throw new IllegalArgumentException("Required parameter '" + key + "' is missing or empty");
            }
        }
    }

    /**
     * Parses a string to integer with proper error handling
     */
    private Integer parseInteger(String value, String paramName) {
        try {
            int parsed = Integer.parseInt(value);
            if (paramName.contains("start") || paramName.contains("offset")) {
                if (parsed < 0) {
                    throw new IllegalArgumentException("Parameter '" + paramName + "' must be >= 0");
                }
            }
            if (paramName.contains("rows") || paramName.contains("p")) {
                if (parsed < 1) {
                    throw new IllegalArgumentException("Parameter '" + paramName + "' must be > 0");
                }
            }
            return parsed;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Parameter '" + paramName + "' must be a valid integer");
        }
    }

    // ============ Deprecated - Use /search endpoint instead ============
    // These endpoints are kept for backward compatibility

    /**
     * @deprecated Use /search?source=springer&q=...&start=...&rows=...&api_key=... instead
     */
    @Deprecated
    @GetMapping("/searchSpringer")
    public Mono<List<Article>> searchSpringer(
            @RequestParam(name = "q") String q,
            @RequestParam(name = "s") Integer s,
            @RequestParam(name = "p") Integer p,
            @RequestParam(name = "api_key") String api_key)
    {
        Map<String, Object> params = Map.of(
                "q", q,
                "s", s,
                "p", p,
                "api_key", api_key
        );

        return apiService.search(Engines.SPRINGER, params);
    }

    /**
     * @deprecated Use /search?source=hal&q=...&start=...&rows=...&wt=... instead
     */
    @Deprecated
    @GetMapping(value = "/searchHal", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<List<Article>> searchHal(
            @RequestParam(name = "q") String q,
            @RequestParam(name = "start") Integer start,
            @RequestParam(name = "rows") Integer rows,
            @RequestParam(name = "wt") String wt)
    {
        Map<String, Object> params = Map.of(
                "q", q,
                "start", start,
                "rows", rows,
                "wt", wt
        );

        return apiService.search(Engines.HAL, params);
    }

    /**
     * @deprecated Use /search?source=acm&q=...&start=...&rows=...&filter=... instead
     */
    @Deprecated
    @GetMapping("/searchACM")
    public Mono<List<Article>> searchACM(
            @RequestParam(name = "querybibliographic") String querybibliographic,
            @RequestParam(name = "filter") String filter,
            @RequestParam(name = "rows") Integer rows,
            @RequestParam(name = "offset") Integer offset)
    {
        Map<String, Object> params = Map.of(
                "query.bibliographic", querybibliographic,
                "filter", filter,
                "rows", rows,
                "offset", offset
        );

        return apiService.search(Engines.ACM, params);
    }
}
