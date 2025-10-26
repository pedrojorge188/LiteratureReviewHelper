package pt.isec.literaturereviewhelper.engines;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.web.reactive.function.client.WebClient;

import pt.isec.literaturereviewhelper.models.Article;

public class ACMEngine extends EngineBase {

    private static final String BASE_URL = "https://api.crossref.org";
    private static final String ENDPOINT = "/works";

    public ACMEngine(WebClient webClient) {
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
    protected Class<?> getResponseType() {
        return Map.class;
    }

    @Override
    public String getEngineName() {
        return "ACM";
    }

    @Override
    @SuppressWarnings("unchecked")
    protected List<Article> extractInformation(Object responseBody) {
        Map<String, Object> data = (Map<String, Object>) responseBody;
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