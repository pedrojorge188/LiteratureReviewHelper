    package pt.isec.literaturereviewhelper.services;

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
    import org.jbibtex.*;
    import org.jbibtex.BibTeXParser;



    @Service
    public class ApiService {

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
                if (rawQuery.length() > 0) rawQuery.append("&");
                rawQuery.append(k).append("=").append(URLEncoder.encode(v.toString(), StandardCharsets.UTF_8));
            });

            String fullURL = baseUrl;
            if (!baseUrl.endsWith("/")) fullURL += "/";
            fullURL += path.startsWith("/") ? path.substring(1) : path;
            if (rawQuery.length() > 0) fullURL += "?" + rawQuery;

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
            List<Map<String, Object>> records = (List<Map<String, Object>>) data.get("records");
            if (records == null) return List.of();

            return records.stream().map(record -> {
                String title = Optional.ofNullable((String) record.get("title"))
                        .orElse("").replace("\n", " ").trim();

                String pubDate = Optional.ofNullable((String) record.get("publicationDate")).orElse("");
                String publicationYear = pubDate.contains("-") ? pubDate.split("-")[0] : pubDate;

                String venue = (String) record.get("publicationName");
                String venueType = (String) record.get("contentType");

                List<Map<String, String>> creators = (List<Map<String, String>>) record.get("creators");
                String authors = creators != null
                        ? creators.stream().map(c -> c.get("creator")).collect(Collectors.joining(", "))
                        : "";

                List<Map<String, String>> urls = (List<Map<String, String>>) record.get("url");
                String link = (urls != null && !urls.isEmpty()) ? urls.get(0).get("value") : null;

                return new Article(title, publicationYear, venue, venueType, authors, link, "SpringerNature");
            }).collect(Collectors.toList());
        }
        public List<Article> extractHalInformation(String bibtexData) {
            System.out.println("Parsed entries count: ");
            List<Article> articles = new ArrayList<>();
            try {
                BibTeXParser parser = new BibTeXParser();
                BibTeXDatabase database = parser.parse(new StringReader(bibtexData));

                System.out.println("Parsed entries count: " + database.getEntries().size());

                for (BibTeXEntry entry : database.getEntries().values()) {
                    String title = Optional.ofNullable(entry.getField(new Key("TITLE")))
                            .map(Value::toUserString)
                            .map(s -> s.replace("{", "").replace("}", ""))
                            .orElse("");

                    String authors = Optional.ofNullable(entry.getField(new Key("AUTHOR")))
                            .map(Value::toUserString)
                            .map(s -> s.replace(" and ", ", "))
                            .orElse("");

                    String year = Optional.ofNullable(entry.getField(new Key("YEAR")))
                            .map(Value::toUserString)
                            .orElse("");

                    String venue = Optional.ofNullable(
                                    entry.getField(new Key("JOURNAL")) != null ? entry.getField(new Key("JOURNAL")) :
                                            entry.getField(new Key("BOOKTITLE")) != null ? entry.getField(new Key("BOOKTITLE")) :
                                                    entry.getField(new Key("SCHOOL")) != null ? entry.getField(new Key("SCHOOL")) :
                                                            entry.getField(new Key("PUBLISHER"))
                            ).map(Value::toUserString)
                            .orElse("");

                    String entryType = entry.getType().getValue().toLowerCase();

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

                    String link = Optional.ofNullable(entry.getField(new Key("URL")))
                            .map(Value::toUserString)
                            .orElse("");

                    articles.add(new Article(title, year, venue, venueType, authors, link, "HAL Open Science"));
                }
            } catch (Exception e) {
                e.printStackTrace();
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
