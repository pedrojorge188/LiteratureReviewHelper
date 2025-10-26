package pt.isec.literaturereviewhelper.engines;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;
import pt.isec.literaturereviewhelper.models.Article;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.net.URI;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ACMEngineTest {

    private WebClient webClient;
    @SuppressWarnings("rawtypes")
    private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;
    @SuppressWarnings("rawtypes")
    private WebClient.RequestHeadersSpec requestHeadersSpec;
    private WebClient.ResponseSpec responseSpec;
    private ACMEngine acmEngine;

    @SuppressWarnings("unchecked")
    @BeforeEach
    void setUp() {
        webClient = mock(WebClient.class);
        requestHeadersUriSpec = mock(WebClient.RequestHeadersUriSpec.class);
        requestHeadersSpec = mock(WebClient.RequestHeadersSpec.class);
        responseSpec = mock(WebClient.ResponseSpec.class);

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(URI.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.accept(MediaType.APPLICATION_JSON)).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);

        acmEngine = new ACMEngine(webClient);
    }

    @Test
    void testGetEngineName() {
        assertEquals("ACM", acmEngine.getEngineName());
    }

    @Test
    void testSearchSuccess() {
        // Arrange
        Map<String, Object> params = Map.of(
                "query.bibliographic", "artificial intelligence",
                "offset", 0,
                "rows", 10
        );

        Map<String, Object> mockResponse = Map.of(
                "message", Map.of(
                        "items", List.of(
                                Map.of(
                                        "title", List.of("AI Research Paper"),
                                        "published-print", Map.of(
                                                "date-parts", List.of(List.of(2024, 1, 15))
                                        ),
                                        "author", List.of(
                                                Map.of("given", "John", "family", "Doe"),
                                                Map.of("given", "Jane", "family", "Smith")
                                        ),
                                        "container-title", List.of("Journal of AI"),
                                        "type", "journal-article",
                                        "link", List.of(
                                                Map.of("URL", "https://example.com/article")
                                        )
                                )
                        )
                )
        );

        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(mockResponse));

        // Act
        Mono<List<Article>> result = acmEngine.search(params);

        // Assert
        StepVerifier.create(result)
                .assertNext(articles -> {
                    assertEquals(1, articles.size());
                    Article article = articles.get(0);
                    assertEquals("AI Research Paper", article.getTitle());
                    assertEquals("2024", article.getPublicationYear());
                    assertEquals("Journal of AI", article.getVenue());
                    assertEquals("journal-article", article.getVenueType());
                    assertEquals("John Doe, Jane Smith", article.getAuthors());
                    assertEquals("https://example.com/article", article.getLink());
                    assertEquals("ACM Digital Library", article.getSource());
                })
                .verifyComplete();
    }

    @Test
    void testSearchWithPublishedOnline() {
        // Arrange
        Map<String, Object> params = Map.of("query.bibliographic", "test");

        Map<String, Object> mockResponse = Map.of(
                "message", Map.of(
                        "items", List.of(
                                Map.of(
                                        "title", List.of("Online Article"),
                                        "published-online", Map.of(
                                                "date-parts", List.of(List.of(2023, 5))
                                        )
                                )
                        )
                )
        );

        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(mockResponse));

        // Act
        Mono<List<Article>> result = acmEngine.search(params);

        // Assert
        StepVerifier.create(result)
                .assertNext(articles -> {
                    assertEquals(1, articles.size());
                    assertEquals("2023", articles.get(0).getPublicationYear());
                })
                .verifyComplete();
    }

    @Test
    void testSearchWithEmptyItems() {
        // Arrange
        Map<String, Object> params = Map.of("query.bibliographic", "test");
        Map<String, Object> mockResponse = Map.of(
                "message", Map.of("items", List.of())
        );

        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(mockResponse));

        // Act
        Mono<List<Article>> result = acmEngine.search(params);

        // Assert
        StepVerifier.create(result)
                .assertNext(articles -> assertEquals(0, articles.size()))
                .verifyComplete();
    }

    @Test
    void testSearchWithNoMessageField() {
        // Arrange
        Map<String, Object> params = Map.of("query.bibliographic", "test");
        Map<String, Object> mockResponse = Map.of("status", "error");

        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(mockResponse));

        // Act
        Mono<List<Article>> result = acmEngine.search(params);

        // Assert
        StepVerifier.create(result)
                .assertNext(articles -> assertEquals(0, articles.size()))
                .verifyComplete();
    }

    @Test
    void testSearchWithPartialData() {
        // Arrange
        Map<String, Object> params = Map.of("query.bibliographic", "test");

        Map<String, Object> mockResponse = Map.of(
                "message", Map.of(
                        "items", List.of(
                                Map.of("title", List.of("Minimal Article"))
                        )
                )
        );

        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(mockResponse));

        // Act
        Mono<List<Article>> result = acmEngine.search(params);

        // Assert
        StepVerifier.create(result)
                .assertNext(articles -> {
                    assertEquals(1, articles.size());
                    Article article = articles.get(0);
                    assertEquals("Minimal Article", article.getTitle());
                    assertEquals("", article.getPublicationYear());
                    assertEquals("", article.getVenue());
                    assertEquals("", article.getVenueType());
                    assertEquals("", article.getAuthors());
                    assertEquals("", article.getLink());
                })
                .verifyComplete();
    }

    @Test
    void testSearchWithMultipleArticles() {
        // Arrange
        Map<String, Object> params = Map.of("query.bibliographic", "test");

        Map<String, Object> mockResponse = Map.of(
                "message", Map.of(
                        "items", List.of(
                                Map.of("title", List.of("Article 1")),
                                Map.of("title", List.of("Article 2")),
                                Map.of("title", List.of("Article 3"))
                        )
                )
        );

        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(mockResponse));

        // Act
        Mono<List<Article>> result = acmEngine.search(params);

        // Assert
        StepVerifier.create(result)
                .assertNext(articles -> {
                    assertEquals(3, articles.size());
                    assertEquals("Article 1", articles.get(0).getTitle());
                    assertEquals("Article 2", articles.get(1).getTitle());
                    assertEquals("Article 3", articles.get(2).getTitle());
                })
                .verifyComplete();
    }

    @Test
    void testSearchHandlesTitleWithNewlines() {
        // Arrange
        Map<String, Object> params = Map.of("query.bibliographic", "test");

        Map<String, Object> mockResponse = Map.of(
                "message", Map.of(
                        "items", List.of(
                                Map.of("title", List.of("Title with\nnewlines\nand spaces"))
                        )
                )
        );

        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(mockResponse));

        // Act
        Mono<List<Article>> result = acmEngine.search(params);

        // Assert
        StepVerifier.create(result)
                .assertNext(articles -> {
                    assertEquals(1, articles.size());
                    assertEquals("Title with newlines and spaces", articles.get(0).getTitle());
                })
                .verifyComplete();
    }

    @Test
    void testSearchBuildsCorrectUrl() {
        // Arrange
        Map<String, Object> params = Map.of(
                "query.bibliographic", "machine learning",
                "offset", 0,
                "rows", 5
        );

        Map<String, Object> mockResponse = Map.of("message", Map.of("items", List.of()));
        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(mockResponse));

        // Act
        acmEngine.search(params).subscribe();

        // Assert
        ArgumentCaptor<URI> uriCaptor = ArgumentCaptor.forClass(URI.class);
        verify(requestHeadersUriSpec).uri(uriCaptor.capture());

        URI capturedUri = uriCaptor.getValue();
        assertTrue(capturedUri.toString().contains("api.crossref.org"));
        assertTrue(capturedUri.toString().contains("/works"));
        assertTrue(capturedUri.toString().contains("query.bibliographic=machine+learning"));
    }

    @Test
    void testSearchHandlesError() {
        // Arrange
        Map<String, Object> params = Map.of("query.bibliographic", "test");
        RuntimeException error = new RuntimeException("API Error");

        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.error(error));

        // Act
        Mono<List<Article>> result = acmEngine.search(params);

        // Assert
        StepVerifier.create(result)
                .expectError(RuntimeException.class)
                .verify();
    }

    @Test
    void testSearchWithAuthorsButNoGivenName() {
        // Arrange
        Map<String, Object> params = Map.of("query.bibliographic", "test");

        Map<String, Object> mockResponse = Map.of(
                "message", Map.of(
                        "items", List.of(
                                Map.of(
                                        "title", List.of("Article"),
                                        "author", List.of(
                                                Map.of("family", "Doe"),
                                                Map.of("given", "Jane", "family", "Smith")
                                        )
                                )
                        )
                )
        );

        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(mockResponse));

        // Act
        Mono<List<Article>> result = acmEngine.search(params);

        // Assert
        StepVerifier.create(result)
                .assertNext(articles -> {
                    assertEquals(1, articles.size());
                    assertEquals(" Doe, Jane Smith", articles.get(0).getAuthors());
                })
                .verifyComplete();
    }

    @Test
    void testSearchWithEmptyLinkList() {
        // Arrange
        Map<String, Object> params = Map.of("query.bibliographic", "test");

        Map<String, Object> mockResponse = Map.of(
                "message", Map.of(
                        "items", List.of(
                                Map.of(
                                        "title", List.of("Article"),
                                        "link", List.of()
                                )
                        )
                )
        );

        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(mockResponse));

        // Act
        Mono<List<Article>> result = acmEngine.search(params);

        // Assert
        StepVerifier.create(result)
                .assertNext(articles -> {
                    assertEquals(1, articles.size());
                    assertEquals("", articles.get(0).getLink());
                })
                .verifyComplete();
    }

    @Test
    void testSearchWithNullItems() {
        // Arrange
        Map<String, Object> params = Map.of("query.bibliographic", "test");

        // Create a mutable map that can contain null values
        Map<String, Object> messageMap = new java.util.HashMap<>();
        messageMap.put("items", null);
        Map<String, Object> mockResponse = Map.of("message", messageMap);

        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(mockResponse));

        // Act
        Mono<List<Article>> result = acmEngine.search(params);

        // Assert
        StepVerifier.create(result)
                .assertNext(articles -> assertEquals(0, articles.size()))
                .verifyComplete();
    }
}
