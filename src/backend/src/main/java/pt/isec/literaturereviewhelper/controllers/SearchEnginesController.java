package pt.isec.literaturereviewhelper.controllers;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import pt.isec.literaturereviewhelper.model.Article;
import pt.isec.literaturereviewhelper.services.ApiService;
import reactor.core.publisher.Mono;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.validation.annotation.Validated;

@Validated
@RestController
@RequestMapping("api")
public class SearchEnginesController {

    private final ApiService apiService;

    public SearchEnginesController(ApiService apiService) {
        this.apiService = apiService;
    }

    /**
     * Springer Nature RequestParams
     *
     * @param q       Query string
     * @param s       From which article index it starts
     * @param p       Number of articles to return
     * @param api_key In order to use this API a unique key is needed
     * required       parameter and its value must not be empty
     */

    @GetMapping("/searchSpringer")
    public Mono<List<Article>> searchSpringer(
            @RequestParam(name = "q") @NotBlank(message = "Query string 'q' is empty") String q,
            @RequestParam(name = "s") @Min(value = 0, message = "article index 's' must be >= 0") Integer s,
            @RequestParam(name = "p") @Min(value = 1, message = "Number of articles 'p' must be > 0") Integer p,
            @RequestParam(name = "api_key") @NotBlank(message = "API key is empty") String api_key)
    {
        Map<String, Object> params = Map.of(
                "q", q,
                "s", s,
                "p", p,
                "api_key", api_key
        );

        return apiService.searchAsync(
                "https://api.springernature.com",
                "/meta/v2/json",
                params,
                Map.class,
                apiService::extractSpringerInformation,
                MediaType.APPLICATION_JSON
        ).doOnNext(System.out::println);
    }

    /**
     * Hal Open Science RequestParams
     *
     * @param q      Query string
     * @param start  From which article index it starts
     * @param rows   Number of items to return
     * @param wt     Content-type API returns response (x-bibtex, json)
     * required      parameter and its value must not be empty
     * produces      defined as JSON so we can specify how the mapping is going to occur
     */
    @GetMapping(value = "/searchHal", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<List<Article>> searchHal(
            @RequestParam(name = "q") @NotBlank(message = "Query 'q' is empty") String q,
            @RequestParam(name = "start") @Min(value = 0, message = "'start' must be >= 0") Integer start,
            @RequestParam(name = "rows") @Min(value = 1, message = "'rows' must be > 0") Integer rows,
            @RequestParam(name = "wt") @NotBlank(message = "Parameter 'wt' is empty") String wt)
    {
        Map<String, Object> params = Map.of(
                "q", q,
                "start", start,
                "rows", rows,
                "wt", wt
        );

        return apiService.searchAsync(
                "https://api.archives-ouvertes.fr",
                "/search/",
                params,
                String.class,
                apiService::extractHalInformation,
                MediaType.TEXT_PLAIN
        ).doOnNext(System.out::println);
    }

    /**
     * Hal Open Science RequestParams
     *
     * @param querybibliographic Base URL of the API
     * @param filter  Which database crossref is pointing at
     * @param rows    Number of items to return
     * @param offset  Content-type API returns response (x-bibtex, json)
     * required parameter and its value must not be empty
     */
    @GetMapping("/searchACM")
    public Mono<List<Article>> searchACM(
            @RequestParam(name = "querybibliographic") @NotBlank(message = "'querybibliographic' is empty") String querybibliographic,
            @RequestParam(name = "filter") @NotBlank(message = "'filter' is empty") String filter,
            @RequestParam(name = "rows") @Min(value = 1, message = "'rows' must be > 0") Integer rows,
            @RequestParam(name = "offset") @Min(value = 0, message = "'offset' must be >= 0") Integer offset)
    {
        Map<String, Object> params = Map.of(
                "query.bibliographic", querybibliographic,
                "filter", filter,
                "rows", rows,
                "offset", offset
        );

        return apiService.searchAsync(
                "https://api.crossref.org",
                "/works",
                params,
                Map.class,
                apiService::extractACMInformation,
                MediaType.APPLICATION_JSON
        ).doOnNext(System.out::println);
    }
}
