    package pt.isec.literaturereviewhelper.services;

    import org.slf4j.Logger;
    import org.slf4j.LoggerFactory;
    import org.springframework.http.MediaType;
    import org.springframework.stereotype.Service;
    import org.springframework.web.reactive.function.client.WebClient;
    import pt.isec.literaturereviewhelper.model.Article;
    import reactor.core.publisher.Mono;
    import java.io.StringReader;
    import java.net.URI;
    import java.net.URLEncoder;
    import java.nio.charset.StandardCharsets;
    import java.util.List;
    import java.util.Map;
    import java.util.stream.Collectors;
    import java.util.*;
    import java.util.function.Function;
    import java.util.stream.Stream;

    import org.jbibtex.*;
    import org.jbibtex.BibTeXParser;



    @Service
    public class ApiService {

        private static final Logger log = LoggerFactory.getLogger(ApiService.class);
        private final WebClient webClient;

        public ApiService(WebClient webClient) {
            this.webClient = webClient;
        }

        /**
         * Generic searchAsync method that can handle any API.
         *
         * @param baseUrl      Base URL of the API
         * @param path         Path endpoint
         * @param queryParams  Map of query parameters
         * @param responseType Type of the response (e.g., Map.class or String.class)
         * @param extractor    Function to convert the response to List<Article>
         * @param <T>          Response type
         * @param mediaType    Media Type
         * @return Mono<List<Article>>
         */


        public <T> Mono<List<Article>> searchAsync(
                String baseUrl,
                String path,
                Map<String, Object> queryParams,
                Class<T> responseType,
                Function<T, List<Article>> extractor,
                MediaType mediaType) {

            StringBuilder rawQuery = new StringBuilder();
            queryParams.forEach((k, v) -> {
                if (!rawQuery.isEmpty()) rawQuery.append("&");
                rawQuery.append(k).append("=").append(URLEncoder.encode(v.toString(), StandardCharsets.UTF_8));
            });

            String fullURL = baseUrl;
            if (!baseUrl.endsWith("/")) fullURL += "/";
            fullURL += path.startsWith("/") ? path.substring(1) : path;
            if (!rawQuery.isEmpty()) fullURL += "?" + rawQuery;

            return webClient.get()
                    .uri(URI.create(fullURL))
                    .accept(mediaType)
                    .retrieve()
                    .bodyToMono(responseType)      // generic response type
                    //.doOnNext(resp -> System.out.println("Response received: " + resp))
                    .map(extractor);               // use the extractor function passed in
        }

        // ---------------- Extractors ---------------- //

        public List<Article> extractSpringerInformation(Map<String, Object> data) {
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
                        String venue = Optional.ofNullable(record.get("publicationName")).map(Object::toString).orElse("");
                        String venueType = Optional.ofNullable(record.get("contentType")).map(Object::toString).orElse("");

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
                        if (urlsObj instanceof List<?> urlsList && !urlsList.isEmpty() && urlsList.get(0) instanceof Map<?, ?> firstUrl) {
                            link = Optional.ofNullable(firstUrl.get("value")).map(Object::toString).orElse(null);
                        }

                        return new Article(title, publicationYear, venue, venueType, authors, link, "SpringerNature");
                    })
                    .collect(Collectors.toList());
        }

        public List<Article> extractHalInformation(String bibtexData) {
            List<Article> articles = new ArrayList<>();
            try {
                BibTeXParser parser = new BibTeXParser();
                BibTeXDatabase database = parser.parse(new StringReader(bibtexData));

                System.out.println("Parsed entries count: " + database.getEntries().size());

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
                log.atError().log(e.getMessage());
            }
            return articles;
        }

        public List<Article> extractACMInformation(Map<String, Object> data) {
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
                            List<List<Integer>> dateParts = (List<List<Integer>>) ((Map<String, Object>) entry.getOrDefault("published-print", entry.getOrDefault("published-online", Map.of()))).get("date-parts");
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

                        // Venue Type (from Crossref type field)
                        String venueType = Optional.ofNullable((String) entry.get("type")).orElse("");

                        // Primary Link
                        String link = Optional.ofNullable((List<Map<String, String>>) entry.get("link"))
                                .filter(list -> !list.isEmpty())
                                .map(list -> list.get(0).get("URL"))
                                .orElse("");

                        articles.add(new Article(title, year != null ? year.toString() : "", venue, venueType, authors, link, "ACM Digital Library"));
                    }
                }
            }

            System.out.println("Fetched " + articles.size() + " results from ACM Digital Library.");
            return articles;
        }


    }
