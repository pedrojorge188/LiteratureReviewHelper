package pt.isec.literaturereviewhelper.engines;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

import pt.isec.literaturereviewhelper.interfaces.IResultMapper;
import pt.isec.literaturereviewhelper.models.ACMResponse;
import pt.isec.literaturereviewhelper.models.Article;

import pt.isec.literaturereviewhelper.models.Engines;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.net.URI;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ACMEngineTest {
    protected WebClient webClient;
    @SuppressWarnings("rawtypes")
    protected WebClient.RequestHeadersUriSpec requestHeadersUriSpec;
    @SuppressWarnings("rawtypes")
    protected WebClient.RequestHeadersSpec requestHeadersSpec;
    private WebClient.ResponseSpec responseSpec;

    private IResultMapper<ACMResponse> resultMapper;
    private ACMEngine acmEngine;

    @BeforeEach
    void setUp() {
        webClient = mock(WebClient.class);
        requestHeadersUriSpec = mock(WebClient.RequestHeadersUriSpec.class);
        requestHeadersSpec = mock(WebClient.RequestHeadersSpec.class);
        responseSpec = mock(WebClient.ResponseSpec.class);

        resultMapper = mock(IResultMapper.class);

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(URI.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.accept(MediaType.APPLICATION_JSON)).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);

        acmEngine = new ACMEngine(webClient, resultMapper);
    }

    @Test
    void testGetEngineName() {
        assertEquals("ACM", acmEngine.getEngineName());
    }

    @Test
    void testSearchSuccess() {
        // Arrange
        Map<String, String> params = Map.of(
                "q", "artificial intelligence",
                "start", "0",
                "rows", "10",
                "deep_search_limit", "1"
        );

        ACMResponse acmResponse = new ACMResponse();
        when(responseSpec.bodyToMono(ACMResponse.class)).thenReturn(Mono.just(acmResponse));

        List<Article> mapped = List.of(
                new Article("AI Research Paper", "2024", "Journal of AI", "journal-article",
                        "John Doe, Jane Smith", "https://example.com/article", Engines.ACM)
        );

        when(resultMapper.map(acmResponse)).thenReturn(mapped);

        // Act
        Mono<List<Article>> result = acmEngine.search(params);

        // Assert
        StepVerifier.create(result)
                .expectNext(mapped)
                .verifyComplete();

        verify(resultMapper, times(1)).map(acmResponse);
        verify(responseSpec, times(1)).bodyToMono(ACMResponse.class);
    }

    @Test
    void testSearchBuildsCorrectUrl() {
        // Arrange
        Map<String, String> params = Map.of(
                "q", "machine learning",
                "start", "0",
                "rows", "5"
        );

        when(responseSpec.bodyToMono(ACMResponse.class)).thenReturn(Mono.just(new ACMResponse()));
        when(resultMapper.map(any(ACMResponse.class))).thenReturn(List.of());

        // Act
        acmEngine.search(params).block();

        // Assert: capture *all* URIs, get the first
        ArgumentCaptor<URI> uriCaptor = ArgumentCaptor.forClass(URI.class);
        verify(requestHeadersUriSpec, atLeastOnce()).uri(uriCaptor.capture());

        URI firstCallUri = uriCaptor.getAllValues().get(0);
        String url = firstCallUri.toString();

        assertTrue(url.contains("api.crossref.org"));
        assertTrue(url.contains("/works"));
        assertTrue(url.contains("query.bibliographic=machine+learning"));
        assertTrue(url.contains("rows=5"));
    }

    @Test
    void testMissingRequiredParamThrows() {
        Map<String, String> raw = Map.of(
                // missing q
                "offset", "0",
                "rows", "10"
        );

        // .search() will throw because we have validateParams() on the engine itself
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> acmEngine.search(raw)
        );
        assertTrue(ex.getMessage().contains("Missing or empty required parameter 'q' for ACM"));
    }

    @Test
    void testReturnsAccumulatedArticlesOnError() {
        // Arrange
        RuntimeException boom = new RuntimeException("API Error");
        when(responseSpec.bodyToMono(ACMResponse.class)).thenReturn(Mono.error(boom));

        // Act
        Mono<List<Article>> result = acmEngine.search(Map.of("q", "test", "start", "0", "rows", "1"));

        // Assert
        StepVerifier.create(result)
                .expectNextMatches(list -> list.isEmpty()) // porque o erro foi engolido
                .verifyComplete();
    }
}
