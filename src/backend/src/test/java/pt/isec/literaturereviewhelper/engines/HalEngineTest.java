package pt.isec.literaturereviewhelper.engines;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

import pt.isec.literaturereviewhelper.dtos.SearchResultDto;
import pt.isec.literaturereviewhelper.interfaces.IResultMapper;
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
    @SuppressWarnings("rawtypes")
    private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;
    private WebClient.ResponseSpec responseSpec;

    private IResultMapper<String> mapper;
    private HalEngine halEngine;

    @BeforeEach
    void setUp() {
        WebClient webClient = mock(WebClient.class);
        requestHeadersUriSpec = mock(WebClient.RequestHeadersUriSpec.class);
        WebClient.RequestHeadersSpec requestHeadersSpec = mock(WebClient.RequestHeadersSpec.class);
        responseSpec = mock(WebClient.ResponseSpec.class);
        mapper = mock(IResultMapper.class);

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(URI.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.accept(MediaType.TEXT_PLAIN)).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);

        halEngine = new HalEngine(webClient, mapper);
    }

    @Test
    void testGetEngineName() {
        assertEquals("HAL", halEngine.getEngineName());
    }

    @Test
    void testSearchSuccess() {
        // Arrange
        Map<String, String> rawParams = Map.of(
                "q", "machine learning",
                "start", "0",
                "rows", "10",
                "wt", "bibtex",
                "deep_search_limit", "1"
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

        Article article = new Article(
                "Machine Learning in Healthcare",
                "2024",
                "Medical Informatics Journal",
                "Journal Article",
                List.of("Doe, John", "Smith, Jane"),
                "https://hal.science/hal-12345",
                pt.isec.literaturereviewhelper.models.Engines.HAL
        );

        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(bibtexResponse));
        when(mapper.map(bibtexResponse)).thenReturn(List.of(article));

        // Act
        Mono<SearchResultDto> result = halEngine.search(rawParams);

        // Assert
        StepVerifier.create(result)
                .assertNext(searchResult -> {
                    List<Article> articles = searchResult.getArticles();
                    assertEquals(1, articles.size());
                    Article a = articles.get(0);
                    assertEquals("Machine Learning in Healthcare", a.title());
                    assertEquals("2024", a.publicationYear());
                    assertEquals("Medical Informatics Journal", a.venue());
                    assertEquals("HAL", a.source().toString());
                    assertEquals(1,searchResult.getStatistics().size()); // No filters applied in this test
                })
                .verifyComplete();

        verify(mapper).map(bibtexResponse);
    }

    @Test
    void testSearchBuildsCorrectUrl() {
        Map<String, String> rawParams = Map.of(
                "q", "deep learning",
                "start", "0",
                "rows", "5",
                "wt", "bibtex",
                "deep_search_limit", "1"
        );

        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(""));
        when(mapper.map("")).thenReturn(List.of());

        halEngine.search(rawParams).block();

        ArgumentCaptor<URI> uriCaptor = ArgumentCaptor.forClass(URI.class);
        verify(requestHeadersUriSpec).uri(uriCaptor.capture());

        URI uri = uriCaptor.getValue();
        String url = uri.toString();
        assertTrue(url.contains("api.archives-ouvertes.fr"));
        assertTrue(url.contains("/search/"));
        assertTrue(url.contains("q=deep+learning"));
        assertTrue(url.contains("wt=bibtex"));
    }

    @Test
    void testSearchWithEmptyResponse() {
        Map<String, String> rawParams = Map.of(
                "q", "test",
                "start", "0",
                "rows", "10",
                "wt", "bibtex"
        );

        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.just(""));
        when(mapper.map("")).thenReturn(List.of());

        StepVerifier.create(halEngine.search(rawParams))
                .assertNext(searchResult -> assertTrue(searchResult.getArticles().isEmpty()))
                .verifyComplete();
    }

    @Test
    void testMissingRequiredParamThrows() {
        Map<String, String> raw = Map.of(
                "q", "machine learning",
                "start", "0",
                // missing rows
                "wt", "bibtex"
        );

        // .search() will throw because we have validateParams() on the engine itself
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> halEngine.search(raw)
        );
        assertTrue(ex.getMessage().contains("Missing or empty required parameter 'rows' for HAL"));
    }

    @Test
    void testSearchHandlesError() {
        Map<String, String> rawParams = Map.of(
                "q", "error",
                "start", "0",
                "rows", "10",
                "wt", "bibtex",
                "deep_search_limit", "1"
        );

        RuntimeException ex = new RuntimeException("API Error");
        when(responseSpec.bodyToMono(String.class)).thenReturn(Mono.error(ex));

        StepVerifier.create(halEngine.search(rawParams))
                .expectNextMatches(searchResult -> searchResult.getArticles().isEmpty())
                .verifyComplete();
    }
}
