package pt.isec.literaturereviewhelper.controllers;

import org.springframework.beans.factory.annotation.Autowired;
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

@RestController
@RequestMapping("api")
public class SearchEnginesController {
    /** Controller to execute search queries */

    private final ApiService apiService;

    public SearchEnginesController(ApiService apiService) {
        this.apiService = apiService;
    }


    @GetMapping("/searchSpringer")
    public Mono<List<Article>> searchSpringer(
            @RequestParam String q,
            @RequestParam int start,
            @RequestParam int count,
            @RequestParam String api_key) {
        if (api_key == null || api_key.isBlank()) {
            return Mono.error(new IllegalArgumentException("API key is required for Springer search."));
        }

        Map<String, Object> params = new HashMap<>();
        params.put("q", q);  // Pass encoded query
        params.put("s", start);
        params.put("p", count);
        params.put("api_key", api_key);

        return apiService.searchAsync(
                "https://api.springernature.com",
                "/meta/v2/json",
                params,
                Map.class,
                apiService::extractSpringerInformation,
                MediaType.APPLICATION_JSON
        ).doOnNext(System.out::println);
    }



    @GetMapping(value = "/searchHal", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<List<Article>> searchHal(
            @RequestParam String q,
            @RequestParam int start,
            @RequestParam int rows,
            @RequestParam String wt) {

        Map<String, Object> params = new HashMap<>();
        params.put("q", q);
        params.put("start", start);
        params.put("rows", rows);
        params.put("wt", wt); // request BibTeX format

        String baseUrl = "https://api.archives-ouvertes.fr";
        String path = "/search/";

        return apiService.searchAsync(
                baseUrl,
                path,
                params,
                String.class,
                apiService::extractHalInformation,
                MediaType.TEXT_PLAIN // HAL API returns text/plain content
        ).doOnNext(System.out::println);
    }



    @GetMapping("/searchACM")
    public Mono<List<Article>> searchACM(
            @RequestParam String q,
            @RequestParam int start,
            @RequestParam int count) {

        // Base URL for Crossref works API
        String baseUrl = "https://api.crossref.org";
        String path = "/works";

        Map<String, Object> params = new HashMap<>();
        params.put("query.bibliographic", q);
        params.put("filter", "prefix:10.1145"); // ACM database reference
        params.put("rows", count);
        params.put("offset", start);

        return apiService.searchAsync(
                baseUrl,
                path,
                params,
                Map.class,
                apiService::extractACMInformation,
                MediaType.APPLICATION_JSON
        ).doOnNext(System.out::println);
    }

}
