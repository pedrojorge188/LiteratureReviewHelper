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

class ACMResponseEngineTest {
    protected WebClient webClient;
    @SuppressWarnings("rawtypes")
    protected WebClient.RequestHeadersUriSpec requestHeadersUriSpec;
    @SuppressWarnings("rawtypes")
    protected WebClient.RequestHeadersSpec requestHeadersSpec;
    private WebClient.ResponseSpec responseSpec;

    private IResultMapper<ACMResponse> resultMapper;
    private ACMEngine acmEngine;

    @SuppressWarnings("unchecked")
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
                "rows", "10"
        );

        ACMResponse acmResponse = new ACMResponse();
        when(responseSpec.bodyToMono(eq(ACMResponse.class))).thenReturn(Mono.just(acmResponse));

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
        verify(responseSpec, times(1)).bodyToMono(eq(ACMResponse.class));
    }

    @Test
    void testSearchBuildsCorrectUrl() {
        // Arrange
        Map<String, String> params = Map.of(
                "q", "machine learning",
                "start", "0",
                "rows", "5"
        );

        when(responseSpec.bodyToMono(eq(ACMResponse.class))).thenReturn(Mono.just(new ACMResponse()));
        when(resultMapper.map(any(ACMResponse.class))).thenReturn(List.of());

        // Act
        acmEngine.search(params).block();

        // Assert
        ArgumentCaptor<URI> uriCaptor = ArgumentCaptor.forClass(URI.class);
        verify(requestHeadersUriSpec).uri(uriCaptor.capture());

        String url = uriCaptor.getValue().toString();
        assertTrue(url.contains("api.crossref.org"));
        assertTrue(url.contains("/works"));
        assertTrue(url.contains("query.bibliographic=machine+learning"));
        assertTrue(url.contains("rows=5"));
        assertTrue(url.contains("offset=0"));
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
    void testPropagatesErrorFromHttp() {
        // Arrange
        RuntimeException boom = new RuntimeException("API Error");
        when(responseSpec.bodyToMono(eq(ACMResponse.class))).thenReturn(Mono.error(boom));

        // Act
        Mono<List<Article>> result = acmEngine.search(Map.of("q", "test", "start", "0", "rows", "1"));

        // Assert
        StepVerifier.create(result)
                .expectErrorMatches(t -> t instanceof RuntimeException && t.getMessage().contains("API Error"))
                .verify();
    }
}
