package pt.isec.literaturereviewhelper.SearchEngines;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.*;
import pt.isec.literaturereviewhelper.model.Article;
import pt.isec.literaturereviewhelper.services.ApiService;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ApiServiceTest {

    private WebClient webClient;
    private WebClient.RequestHeadersUriSpec requestUriSpec;
    private WebClient.RequestHeadersSpec requestHeadersSpec;
    private WebClient.ResponseSpec responseSpec;
    private ApiService apiService;

    @BeforeEach
    void setUp() {
        webClient = mock(WebClient.class);
        requestUriSpec = mock(WebClient.RequestHeadersUriSpec.class); // raw type
        requestHeadersSpec = mock(WebClient.RequestHeadersSpec.class); // raw type
        responseSpec = mock(WebClient.ResponseSpec.class);

        // chain mocking using raw types
        when(webClient.get()).thenReturn(requestUriSpec);
        when(requestUriSpec.uri(any(URI.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.accept(any(MediaType.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);

        apiService = new ApiService(webClient);
    }

    // ---------------- Test searchAsync with WebClient error ----------------
    @Test
    void testSearchAsync_ApiError() {
        // Simulate WebClient error
        when(responseSpec.bodyToMono(Map.class))
                .thenReturn(Mono.error(new WebClientResponseException(
                        500, "Internal Server Error", null,
                        "Something went wrong".getBytes(StandardCharsets.UTF_8),
                        StandardCharsets.UTF_8
                )));

        Mono<List<Article>> resultMono = apiService.searchAsync(
                "http://dummy.com",
                "/test",
                Map.of("q", "AI"),
                Map.class,
                map -> List.of(),
                MediaType.APPLICATION_JSON
        );

        WebClientResponseException ex = assertThrows(WebClientResponseException.class, resultMono::block);
        assertEquals(500, ex.getRawStatusCode());
        assertEquals("Internal Server Error", ex.getStatusText());
    }

    // ---------------- Test extractSpringerInformation ----------------
    @Test
    void testExtractSpringerInformation() {
        Map<String, Object> record = Map.of(
                "title", "Test Article",
                "publicationDate", "2023-05-01",
                "publicationName", "Springer Journal",
                "contentType", "Article",
                "creators", List.of(Map.of("creator", "John Doe")),
                "url", List.of(Map.of("value", "http://example.com"))
        );
        Map<String, Object> data = Map.of("records", List.of(record));

        List<Article> articles = apiService.extractSpringerInformation(data);

        assertEquals(1, articles.size());
        Article a = articles.get(0);
        assertEquals("Test Article", a.getTitle());
        assertEquals("Springer Journal", a.getVenue());
        assertEquals("Article", a.getVenueType());
        assertEquals("John Doe", a.getAuthors());
        assertEquals("http://example.com", a.getLink());
        assertEquals("SpringerNature", a.getSource());
    }

    // ---------------- Test extractHalInformation ----------------
    @Test
    void testExtractHalInformation() {
        String bibtex = """
                @article{test1,
                  title={Sample HAL Paper},
                  author={Alice Smith and Bob Jones},
                  year={2022},
                  journal={HAL Journal},
                  url={http://hal.example.com}
                }
                """;

        List<Article> articles = apiService.extractHalInformation(bibtex);

        assertEquals(1, articles.size());
        Article a = articles.get(0);
        assertEquals("Sample HAL Paper", a.getTitle());
        assertEquals("HAL Journal", a.getVenue());
        assertEquals("Journal Article", a.getVenueType());
        assertEquals("Alice Smith, Bob Jones", a.getAuthors());
        assertEquals("http://hal.example.com", a.getLink());
        assertEquals("HAL Open Science", a.getSource());
    }

    // ---------------- Test extractACMInformation ----------------
    @Test
    void testExtractACMInformation() {
        Map<String, Object> entry = Map.of(
                "title", List.of("ACM Paper"),
                "published-print", Map.of("date-parts", List.of(List.of(2021))),
                "author", List.of(Map.of("given", "Jane", "family", "Doe")),
                "container-title", List.of("ACM Conference"),
                "type", "inproceedings",
                "link", List.of(Map.of("URL", "http://acm.example.com"))
        );
        Map<String, Object> message = Map.of("items", List.of(entry));
        Map<String, Object> data = Map.of("message", message);

        List<Article> articles = apiService.extractACMInformation(data);

        assertEquals(1, articles.size());
        Article a = articles.get(0);
        assertEquals("ACM Paper", a.getTitle());
        assertEquals("ACM Conference", a.getVenue());
        assertEquals("inproceedings", a.getVenueType());
        assertEquals("Jane Doe", a.getAuthors());
        assertEquals("http://acm.example.com", a.getLink());
        assertEquals("ACM Digital Library", a.getSource());
    }
}
