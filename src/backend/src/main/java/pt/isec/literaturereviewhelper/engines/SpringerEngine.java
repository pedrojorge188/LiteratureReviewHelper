package pt.isec.literaturereviewhelper.engines;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.web.reactive.function.client.WebClient;

import pt.isec.literaturereviewhelper.models.Article;

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
    protected Class<?> getResponseType() {
        return Map.class;
    }

    @Override
    public String getEngineName() {
        return "Springer";
    }

    @Override
    @SuppressWarnings("unchecked")
    protected List<Article> extractInformation(Object responseBody) {
        Map<String, Object> data = (Map<String, Object>) responseBody;
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