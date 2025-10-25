package pt.isec.literaturereviewhelper.engines;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

import pt.isec.literaturereviewhelper.models.Article;
import reactor.core.publisher.Mono;

public class SpringerEngine extends EngineBase {

    private static final String BASE_URL = "https://api.springernature.com";
    private static final String ENDPOINT = "/meta/v2/json";

    public SpringerEngine(WebClient webClient) {
        super(webClient);
    }

    @Override
    protected String getBaseUrl() {
        return BASE_URL;
    }

    @Override
    protected String getEndpoint() {
        return ENDPOINT;
    }

    @Override
    public Mono<List<Article>> search(Map<String, Object> params) {
        String fullURL = buildURL(params);
        
        return webClient.get()
                .uri(URI.create(fullURL))
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .bodyToMono(Map.class)
                .doOnError(e -> log.error("❌ Error fetching from Springer: {}", e.getMessage()))
                .doOnNext(resp -> log.info("✅ Response received from Springer"))
                .map(this::extractInformation);
    }

    @Override
    public String getEngineName() {
        return "Springer";
    }

    private List<Article> extractInformation(Map<String, Object> data) {
        Object recordsObj = data.get("records");
        if (!(recordsObj instanceof List<?> recordsList)) {
            return List.of();
        }

        return recordsList.stream()
                .filter(recordObj -> recordObj instanceof Map<?, ?>)
                .map(recordObj -> {
                    Map<?, ?> record = (Map<?, ?>) recordObj;

                    // Title
                    String title = Optional.ofNullable(record.get("title"))
                            .map(Object::toString)
                            .map(s -> s.replace("\n", " ").trim())
                            .orElse("");

                    // Publication Year
                    String pubDate = Optional.ofNullable(record.get("publicationDate"))
                            .map(Object::toString)
                            .orElse("");
                    String publicationYear = pubDate.contains("-") ? pubDate.split("-")[0] : pubDate;

                    // Venue and Type
                    String venue = Optional.ofNullable(record.get("publicationName"))
                            .map(Object::toString)
                            .orElse("");
                    String venueType = Optional.ofNullable(record.get("contentType"))
                            .map(Object::toString)
                            .orElse("");

                    // Authors
                    String authors = "";
                    Object creatorsObj = record.get("creators");
                    if (creatorsObj instanceof List<?> creatorsList) {
                        authors = creatorsList.stream()
                                .filter(c -> c instanceof Map<?, ?>)
                                .map(c -> ((Map<?, ?>) c).get("creator"))
                                .filter(Objects::nonNull)
                                .map(Object::toString)
                                .collect(Collectors.joining(", "));
                    }

                    // Link
                    String link = null;
                    Object urlsObj = record.get("url");
                    if (urlsObj instanceof List<?> urlsList && !urlsList.isEmpty() 
                            && urlsList.get(0) instanceof Map<?, ?> firstUrl) {
                        link = Optional.ofNullable(firstUrl.get("value"))
                                .map(Object::toString)
                                .orElse(null);
                    }

                    return new Article(title, publicationYear, venue, venueType, authors, link, "SpringerNature");
                })
                .collect(Collectors.toList());
    }
}