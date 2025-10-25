package pt.isec.literaturereviewhelper.engines;

import java.io.StringReader;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Stream;

import org.jbibtex.BibTeXDatabase;
import org.jbibtex.BibTeXEntry;
import org.jbibtex.BibTeXParser;
import org.jbibtex.Key;
import org.jbibtex.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

import pt.isec.literaturereviewhelper.interfaces.ISearchEngine;
import pt.isec.literaturereviewhelper.models.Article;
import reactor.core.publisher.Mono;

public class HalEngine implements ISearchEngine {

    private static final Logger log = LoggerFactory.getLogger(HalEngine.class);
    private static final String BASE_URL = "https://api.archives-ouvertes.fr";
    private static final String ENDPOINT = "/search/";
    
    private final WebClient webClient;

    public HalEngine(WebClient webClient) {
        this.webClient = webClient;
    }

    @Override
    public Mono<List<Article>> search(Map<String, Object> params) {
        String fullURL = buildURL(params);
        
        return webClient.get()
                .uri(URI.create(fullURL))
                .accept(MediaType.TEXT_PLAIN)
                .retrieve()
                .bodyToMono(String.class)
                .doOnError(e -> log.error("❌ Error fetching from HAL: {}", e.getMessage()))
                .doOnNext(resp -> log.info("✅ Response received from HAL"))
                .map(this::extractInformation);
    }

    @Override
    public String getEngineName() {
        return "HAL";
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

    private List<Article> extractInformation(String bibtexData) {
        List<Article> articles = new ArrayList<>();
        try {
            BibTeXParser parser = new BibTeXParser();
            BibTeXDatabase database = parser.parse(new StringReader(bibtexData));

            log.info("Parsed {} entries from HAL", database.getEntries().size());

            for (BibTeXEntry entry : database.getEntries().values()) {
                // Title
                String title = Optional.ofNullable(entry.getField(new Key("TITLE")))
                        .map(Value::toUserString)
                        .map(s -> s.replace("{", "").replace("}", ""))
                        .orElse("");

                // Authors
                String authors = Optional.ofNullable(entry.getField(new Key("AUTHOR")))
                        .map(Value::toUserString)
                        .map(s -> s.replace(" and ", ", "))
                        .orElse("");

                // Year
                String year = Optional.ofNullable(entry.getField(new Key("YEAR")))
                        .map(Value::toUserString)
                        .orElse("");

                // Venue: JOURNAL > BOOKTITLE > SCHOOL > PUBLISHER
                String venue = Stream.of("JOURNAL", "BOOKTITLE", "SCHOOL", "PUBLISHER")
                        .map(key -> entry.getField(new Key(key)))
                        .filter(Objects::nonNull)
                        .map(Value::toUserString)
                        .findFirst()
                        .orElse("");

                // Venue type
                String entryType = Optional.ofNullable(entry.getType())
                        .map(type -> type.getValue().toLowerCase())
                        .orElse("");

                Map<String, String> venueTypeMapping = Map.of(
                        "inproceedings", "Conference Proceedings",
                        "phdthesis", "PhD Thesis",
                        "article", "Journal Article",
                        "unpublished", "Unpublished",
                        "book", "Book",
                        "incollection", "Book Chapter",
                        "mastersthesis", "Master's Thesis"
                );
                String venueType = venueTypeMapping.getOrDefault(entryType, "");

                // Link
                String link = Optional.ofNullable(entry.getField(new Key("URL")))
                        .map(Value::toUserString)
                        .orElse("");

                articles.add(new Article(title, year, venue, venueType, authors, link, "HAL Open Science"));
            }
        } catch (Exception e) {
            log.error("Error parsing BibTeX from HAL: {}", e.getMessage());
        }
        return articles;
    }
}