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

class SpringerEngineTest {

    private WebClient webClient;
    @SuppressWarnings("rawtypes")
    private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;
    @SuppressWarnings("rawtypes")
    private WebClient.RequestHeadersSpec requestHeadersSpec;
    private WebClient.ResponseSpec responseSpec;
    private SpringerEngine springerEngine;

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

        springerEngine = new SpringerEngine(webClient);
    }

    @Test
    void testGetEngineName() {
        assertEquals("Springer", springerEngine.getEngineName());
    }

    @Test
    void testSearchSuccess() {
        // Arrange
        Map<String, Object> params = Map.of(
                "q", "artificial intelligence",
                "s", 0,
                "p", 10,
                "api_key", "test-key"
        );

        Map<String, Object> mockResponse = Map.of(
                "records", List.of(
                        Map.of(
                                "title", "AI Research Paper",
                                "publicationDate", "2024-01-15",
                                "publicationName", "Journal of AI",
                                "contentType", "Article",
                                "creators", List.of(
                                        Map.of("creator", "John Doe"),
                                        Map.of("creator", "Jane Smith")
                                ),
                                "url", List.of(
                                        Map.of("value", "https://example.com/article")
                                )
                        )
                )
        );

        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(mockResponse));

        // Act
        Mono<List<Article>> result = springerEngine.search(params);

        // Assert
        StepVerifier.create(result)
                .assertNext(articles -> {
                    assertEquals(1, articles.size());
                    Article article = articles.get(0);
                    assertEquals("AI Research Paper", article.getTitle());
                    assertEquals("2024", article.getPublicationYear());
                    assertEquals("Journal of AI", article.getVenue());
                    assertEquals("Article", article.getVenueType());
                    assertEquals("John Doe, Jane Smith", article.getAuthors());
                    assertEquals("https://example.com/article", article.getLink());
                    assertEquals("SpringerNature", article.getSource());
                })
                .verifyComplete();
    }

    @Test
    void testSearchWithEmptyRecords() {
        // Arrange
        Map<String, Object> params = Map.of("q", "test");
        Map<String, Object> mockResponse = Map.of("records", List.of());

        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(mockResponse));

        // Act
        Mono<List<Article>> result = springerEngine.search(params);

        // Assert
        StepVerifier.create(result)
                .assertNext(articles -> assertEquals(0, articles.size()))
                .verifyComplete();
    }

    @Test
    void testSearchWithMissingRecordsField() {
        // Arrange
        Map<String, Object> params = Map.of("q", "test");
        Map<String, Object> mockResponse = Map.of("message", "No records");

        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(mockResponse));

        // Act
        Mono<List<Article>> result = springerEngine.search(params);

        // Assert
        StepVerifier.create(result)
                .assertNext(articles -> assertEquals(0, articles.size()))
                .verifyComplete();
    }

    @Test
    void testSearchWithPartialData() {
        // Arrange
        Map<String, Object> params = Map.of("q", "test");
        Map<String, Object> mockResponse = Map.of(
                "records", List.of(
                        Map.of(
                                "title", "Incomplete Article"
                                // Missing other fields
                        )
                )
        );

        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(mockResponse));

        // Act
        Mono<List<Article>> result = springerEngine.search(params);

        // Assert
        StepVerifier.create(result)
                .assertNext(articles -> {
                    assertEquals(1, articles.size());
                    Article article = articles.get(0);
                    assertEquals("Incomplete Article", article.getTitle());
                    assertEquals("", article.getPublicationYear());
                    assertEquals("", article.getVenue());
                    assertEquals("", article.getVenueType());
                    assertEquals("", article.getAuthors());
                    assertNull(article.getLink());
                })
                .verifyComplete();
    }

    @Test
    void testSearchBuildsCorrectUrl() {
        // Arrange
        Map<String, Object> params = Map.of(
                "q", "machine learning",
                "s", 0,
                "p", 5
        );

        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(Map.of("records", List.of())));

        // Act
        springerEngine.search(params).subscribe();

        // Assert
        ArgumentCaptor<URI> uriCaptor = ArgumentCaptor.forClass(URI.class);
        verify(requestHeadersUriSpec).uri(uriCaptor.capture());

        URI capturedUri = uriCaptor.getValue();
        assertTrue(capturedUri.toString().contains("api.springernature.com"));
        assertTrue(capturedUri.toString().contains("/meta/v2/json"));
        assertTrue(capturedUri.toString().contains("q=machine+learning"));
    }

    @Test
    void testSearchHandlesError() {
        // Arrange
        Map<String, Object> params = Map.of("q", "test");
        RuntimeException error = new RuntimeException("API Error");

        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.error(error));

        // Act
        Mono<List<Article>> result = springerEngine.search(params);

        // Assert
        StepVerifier.create(result)
                .expectError(RuntimeException.class)
                .verify();
    }

    @Test
    void testSearchWithMultipleArticles() {
        // Arrange
        Map<String, Object> params = Map.of("q", "test");
        Map<String, Object> mockResponse = Map.of(
                "records", List.of(
                        Map.of("title", "Article 1", "publicationDate", "2023-01-01"),
                        Map.of("title", "Article 2", "publicationDate", "2023-02-01"),
                        Map.of("title", "Article 3", "publicationDate", "2023-03-01")
                )
        );

        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(mockResponse));

        // Act
        Mono<List<Article>> result = springerEngine.search(params);

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
        Map<String, Object> params = Map.of("q", "test");
        Map<String, Object> mockResponse = Map.of(
                "records", List.of(
                        Map.of("title", "Title with\nnewlines\nand spaces")
                )
        );

        when(responseSpec.bodyToMono(Map.class)).thenReturn(Mono.just(mockResponse));

        // Act
        Mono<List<Article>> result = springerEngine.search(params);

        // Assert
        StepVerifier.create(result)
                .assertNext(articles -> {
                    assertEquals(1, articles.size());
                    assertEquals("Title with newlines and spaces", articles.get(0).getTitle());
                })
                .verifyComplete();
    }
}
