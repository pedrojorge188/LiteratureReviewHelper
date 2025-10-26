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

class HalEngineTest {

    private WebClient webClient;
    @SuppressWarnings("rawtypes")
    private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;
    @SuppressWarnings("rawtypes")
    private WebClient.RequestHeadersSpec requestHeadersSpec;
    private WebClient.ResponseSpec responseSpec;
    private HalEngine halEngine;

    @SuppressWarnings("unchecked")
    @BeforeEach
    void setUp() {
        webClient = mock(WebClient.class);
        requestHeadersUriSpec = mock(WebClient.RequestHeadersUriSpec.class);
        requestHeadersSpec = mock(WebClient.RequestHeadersSpec.class);
        responseSpec = mock(WebClient.ResponseSpec.class);

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(URI.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.accept(MediaType.TEXT_PLAIN)).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);

        halEngine = new HalEngine(webClient);
    }

    @Test
    void testGetEngineName() {
        assertEquals("HAL", halEngine.getEngineName());
    }

    @Test
    void testSearchSuccess() {
        // Arrange
        Map<String, Object> params = Map.of(
                "q", "machine learning",
                "start", 0,
                "rows", 10,
                "wt", "bibtex"
        );

        String bibtexResponse = """
                @article{test2024,
                  TITLE = {Machine Learning in Healthcare},
                  AUTHOR = {Doe, John and Smith, Jane},
                  YEAR = {2024},
                  JOURNAL = {Medical Informatics Journal},
                  URL = {https://hal.science/hal-12345}
                }
                """;

        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(bibtexResponse));

        // Act
        Mono<List<Article>> result = halEngine.search(params);

        // Assert
        StepVerifier.create(result)
                .assertNext(articles -> {
                    assertEquals(1, articles.size());
                    Article article = articles.get(0);
                    assertEquals("Machine Learning in Healthcare", article.getTitle());
                    assertEquals("2024", article.getPublicationYear());
                    assertEquals("Medical Informatics Journal", article.getVenue());
                    assertEquals("Doe, John, Smith, Jane", article.getAuthors());
                    assertEquals("https://hal.science/hal-12345", article.getLink());
                    assertEquals("HAL Open Science", article.getSource());
                })
                .verifyComplete();
    }

    @Test
    void testSearchWithInproceedings() {
        // Arrange
        Map<String, Object> params = Map.of("q", "test");

        String bibtexResponse = """
                @inproceedings{conf2024,
                  TITLE = {Conference Paper Title},
                  AUTHOR = {Author, Test},
                  YEAR = {2024},
                  BOOKTITLE = {International Conference on AI}
                }
                """;

        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(bibtexResponse));

        // Act
        Mono<List<Article>> result = halEngine.search(params);

        // Assert
        StepVerifier.create(result)
                .assertNext(articles -> {
                    assertEquals(1, articles.size());
                    Article article = articles.get(0);
                    assertEquals("Conference Paper Title", article.getTitle());
                    assertEquals("International Conference on AI", article.getVenue());
                    assertEquals("Conference Proceedings", article.getVenueType());
                })
                .verifyComplete();
    }

    @Test
    void testSearchWithPhdThesis() {
        // Arrange
        Map<String, Object> params = Map.of("q", "test");

        String bibtexResponse = """
                @phdthesis{phd2023,
                  TITLE = {PhD Thesis on Quantum Computing},
                  AUTHOR = {Student, Phd},
                  YEAR = {2023},
                  SCHOOL = {MIT}
                }
                """;

        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(bibtexResponse));

        // Act
        Mono<List<Article>> result = halEngine.search(params);

        // Assert
        StepVerifier.create(result)
                .assertNext(articles -> {
                    assertEquals(1, articles.size());
                    Article article = articles.get(0);
                    assertEquals("PhD Thesis on Quantum Computing", article.getTitle());
                    assertEquals("MIT", article.getVenue());
                    assertEquals("PhD Thesis", article.getVenueType());
                })
                .verifyComplete();
    }

    @Test
    void testSearchWithEmptyResponse() {
        // Arrange
        Map<String, Object> params = Map.of("q", "test");
        String bibtexResponse = "";

        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(bibtexResponse));

        // Act
        Mono<List<Article>> result = halEngine.search(params);

        // Assert
        StepVerifier.create(result)
                .assertNext(articles -> assertEquals(0, articles.size()))
                .verifyComplete();
    }

    @Test
    void testSearchWithMultipleEntries() {
        // Arrange
        Map<String, Object> params = Map.of("q", "test");

        String bibtexResponse = """
                @article{art1,
                  TITLE = {First Article},
                  YEAR = {2023}
                }
                @article{art2,
                  TITLE = {Second Article},
                  YEAR = {2024}
                }
                @inproceedings{conf1,
                  TITLE = {Conference Paper},
                  YEAR = {2024}
                }
                """;

        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(bibtexResponse));

        // Act
        Mono<List<Article>> result = halEngine.search(params);

        // Assert
        StepVerifier.create(result)
                .assertNext(articles -> {
                    assertEquals(3, articles.size());
                    assertEquals("First Article", articles.get(0).getTitle());
                    assertEquals("Second Article", articles.get(1).getTitle());
                    assertEquals("Conference Paper", articles.get(2).getTitle());
                })
                .verifyComplete();
    }

    @Test
    void testSearchHandlesBracesInTitle() {
        // Arrange
        Map<String, Object> params = Map.of("q", "test");

        String bibtexResponse = """
                @article{test,
                  TITLE = {{Title} with {Braces}},
                  YEAR = {2024}
                }
                """;

        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(bibtexResponse));

        // Act
        Mono<List<Article>> result = halEngine.search(params);

        // Assert
        StepVerifier.create(result)
                .assertNext(articles -> {
                    assertEquals(1, articles.size());
                    assertEquals("Title with Braces", articles.get(0).getTitle());
                })
                .verifyComplete();
    }

    @Test
    void testSearchHandlesAuthorFormatting() {
        // Arrange
        Map<String, Object> params = Map.of("q", "test");

        String bibtexResponse = """
                @article{test,
                  TITLE = {Test Article},
                  AUTHOR = {Doe, John and Smith, Jane and Brown, Bob},
                  YEAR = {2024}
                }
                """;

        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(bibtexResponse));

        // Act
        Mono<List<Article>> result = halEngine.search(params);

        // Assert
        StepVerifier.create(result)
                .assertNext(articles -> {
                    assertEquals(1, articles.size());
                    assertEquals("Doe, John, Smith, Jane, Brown, Bob", articles.get(0).getAuthors());
                })
                .verifyComplete();
    }

    @Test
    void testSearchBuildsCorrectUrl() {
        // Arrange
        Map<String, Object> params = Map.of(
                "q", "deep learning",
                "start", 0,
                "rows", 5,
                "wt", "bibtex"
        );

        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(""));

        // Act
        halEngine.search(params).subscribe();

        // Assert
        ArgumentCaptor<URI> uriCaptor = ArgumentCaptor.forClass(URI.class);
        verify(requestHeadersUriSpec).uri(uriCaptor.capture());

        URI capturedUri = uriCaptor.getValue();
        assertTrue(capturedUri.toString().contains("api.archives-ouvertes.fr"));
        assertTrue(capturedUri.toString().contains("/search/"));
        assertTrue(capturedUri.toString().contains("q=deep+learning"));
        assertTrue(capturedUri.toString().contains("wt=bibtex"));
    }

    @Test
    void testSearchHandlesError() {
        // Arrange
        Map<String, Object> params = Map.of("q", "test");
        RuntimeException error = new RuntimeException("API Error");

        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.error(error));

        // Act
        Mono<List<Article>> result = halEngine.search(params);

        // Assert
        StepVerifier.create(result)
                .expectError(RuntimeException.class)
                .verify();
    }

    @Test
    void testSearchWithBook() {
        // Arrange
        Map<String, Object> params = Map.of("q", "test");

        String bibtexResponse = """
                @book{book2024,
                  TITLE = {Advanced Machine Learning},
                  AUTHOR = {Expert, Book},
                  YEAR = {2024},
                  PUBLISHER = {Springer}
                }
                """;

        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(bibtexResponse));

        // Act
        Mono<List<Article>> result = halEngine.search(params);

        // Assert
        StepVerifier.create(result)
                .assertNext(articles -> {
                    assertEquals(1, articles.size());
                    Article article = articles.get(0);
                    assertEquals("Advanced Machine Learning", article.getTitle());
                    assertEquals("Springer", article.getVenue());
                    assertEquals("Book", article.getVenueType());
                })
                .verifyComplete();
    }

    @Test
    void testSearchWithMissingFields() {
        // Arrange
        Map<String, Object> params = Map.of("q", "test");

        String bibtexResponse = """
                @article{minimal,
                  TITLE = {Minimal Article}
                }
                """;

        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(bibtexResponse));

        // Act
        Mono<List<Article>> result = halEngine.search(params);

        // Assert
        StepVerifier.create(result)
                .assertNext(articles -> {
                    assertEquals(1, articles.size());
                    Article article = articles.get(0);
                    assertEquals("Minimal Article", article.getTitle());
                    assertEquals("", article.getPublicationYear());
                    assertEquals("", article.getVenue());
                    assertEquals("", article.getAuthors());
                    assertEquals("", article.getLink());
                })
                .verifyComplete();
    }
}
