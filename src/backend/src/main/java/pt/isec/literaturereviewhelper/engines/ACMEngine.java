

package pt.isec.literaturereviewhelper.engines;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

import pt.isec.literaturereviewhelper.interfaces.ISearchEngine;
import pt.isec.literaturereviewhelper.models.Article;
import reactor.core.publisher.Mono;

public class ACMEngine implements ISearchEngine {

    private static final Logger log = LoggerFactory.getLogger(ACMEngine.class);
    private static final String BASE_URL = "https://api.crossref.org";
    private static final String ENDPOINT = "/works";
    
    private final WebClient webClient;

    public ACMEngine(WebClient webClient) {
        this.webClient = webClient;
    }

    @Override
    public Mono<List<Article>> search(Map<String, Object> params) {
        String fullURL = buildURL(params);
        
        return webClient.get()
                .uri(URI.create(fullURL))
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(Map.class)
                .doOnError(e -> log.error("❌ Error fetching from ACM/Crossref: {}", e.getMessage()))
                .doOnNext(resp -> log.info("✅ Response received from ACM/Crossref"))
                .map(this::extractInformation);
    }

    @Override
    public String getEngineName() {
        return "ACM";
    }

    private String buildURL(Map<String, Object> params) {
        StringBuilder rawQuery = new StringBuilder();
        params.forEach((k, v) -> {
            if (!rawQuery.isEmpty()) rawQuery.append("&");
            rawQuery.append(k).append("=").append(URLEncoder.encode(v.toString(), StandardCharsets.UTF_8));
        });

        String fullURL = BASE_URL + ENDPOINT;
        if (!rawQuery.isEmpty()) {
            fullURL += "?" + rawQuery;
        }
        
        return fullURL;
    }

    @SuppressWarnings("unchecked")
    private List<Article> extractInformation(Map<String, Object> data) {
        List<Article> articles = new ArrayList<>();

        if (data.containsKey("message")) {
            Map<String, Object> message = (Map<String, Object>) data.get("message");
            List<Map<String, Object>> items = (List<Map<String, Object>>) message.get("items");

            if (items != null) {
                for (Map<String, Object> entry : items) {
                    // Title
                    String title = Optional.ofNullable((List<String>) entry.get("title"))
                            .map(list -> list.get(0))
                            .orElse("")
                            .replace("\n", " ").trim();

                    // Publication Year
                    Integer year = null;
                    try {
                        List<List<Integer>> dateParts = (List<List<Integer>>) 
                                ((Map<String, Object>) entry.getOrDefault("published-print", 
                                        entry.getOrDefault("published-online", Map.of()))).get("date-parts");
                        if (dateParts != null && !dateParts.isEmpty() && !dateParts.get(0).isEmpty()) {
                            year = dateParts.get(0).get(0);
                        }
                    } catch (Exception ignored) {}

                    // Authors
                    List<Map<String, String>> authorsList = (List<Map<String, String>>) entry.get("author");
                    String authors = "";
                    if (authorsList != null) {
                        authors = authorsList.stream()
                                .map(a -> a.getOrDefault("given", "") + " " + a.getOrDefault("family", ""))
                                .collect(Collectors.joining(", "));
                    }

                    // Venue
                    String venue = Optional.ofNullable((List<String>) entry.get("container-title"))
                            .map(list -> list.get(0))
                            .orElse("");

                    // Venue Type
                    String venueType = Optional.ofNullable((String) entry.get("type")).orElse("");

                    // Link
                    String link = Optional.ofNullable((List<Map<String, String>>) entry.get("link"))
                            .filter(list -> !list.isEmpty())
                            .map(list -> list.get(0).get("URL"))
                            .orElse("");

                    articles.add(new Article(
                            title, 
                            year != null ? year.toString() : "", 
                            venue, 
                            venueType, 
                            authors, 
                            link, 
                            "ACM Digital Library"
                    ));
                }
            }
        }

        log.info("Fetched {} results from ACM Digital Library", articles.size());
        return articles;
    }
}