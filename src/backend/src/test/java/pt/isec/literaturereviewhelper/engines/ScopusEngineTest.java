package pt.isec.literaturereviewhelper.engines;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;
import pt.isec.literaturereviewhelper.interfaces.IResultMapper;
import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.ScopusResponse;

import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.net.URI;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ScopusEngineTest {

    @SuppressWarnings("rawtypes")
    private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;
    private WebClient.ResponseSpec responseSpec;

    private IResultMapper<ScopusResponse> mapper;
    private ScopusEngine scopusEngine;

    @BeforeEach
    void setUp() {
        WebClient webClient = mock(WebClient.class);
        requestHeadersUriSpec = mock(WebClient.RequestHeadersUriSpec.class);

        WebClient.RequestHeadersSpec requestHeadersSpec = mock(WebClient.RequestHeadersSpec.class);
        responseSpec = mock(WebClient.ResponseSpec.class);

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(URI.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.accept(MediaType.APPLICATION_JSON)).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);

        mapper = mock(IResultMapper.class);
        scopusEngine = new ScopusEngine(webClient, mapper);
    }

    @Test
    void testEngineName() {
        assertEquals("Scopus", scopusEngine.getEngineName());
    }

    @Test
    void testMapParamsProducesCorrectValues() {
        Map<String, String> raw = Map.of(
                "q", "test query",
                "start", "1",
                "rows", "25",
                "api_key", "k",
                "deep_search_limit", "1"
        );

        Map<String, Object> out = scopusEngine.mapParams(raw);

        assertEquals("test query", out.get("query"));
        // start = start * rows = 1 * 25 = 25
        assertEquals(25, out.get("start"));
        assertEquals(25, out.get("count"));
        assertEquals("k", out.get("apiKey"));
    }

    @Test
    void testSearchSuccessMapsResponse() {
        Map<String, String> raw = Map.of(
                "q", "ai",
                "start", "0",
                "rows", "10",
                "api_key", "k",
                "deep_search_limit", "1"
        );

        ScopusResponse resp = new ScopusResponse();

        List<Article> mapped = List.of(
                new Article("A Study", "2023", "", "", List.of(), "", 
                        pt.isec.literaturereviewhelper.models.Engines.SCOPUS)
        );

        when(responseSpec.bodyToMono(ScopusResponse.class)).thenReturn(Mono.just(resp));
        when(mapper.map(resp)).thenReturn(mapped);

        StepVerifier.create(scopusEngine.search(raw))
                .assertNext(result -> {
                    assertEquals(1, result.getArticles().size());
                    assertEquals("A Study", result.getArticles().get(0).title());
                    assertEquals("2023", result.getArticles().get(0).publicationYear());
                    assertEquals(1, result.getStatistics().size());
                })
                .verifyComplete();
    }

    @Test
    void testBuildsCorrectUrlAndMappedParams() {
        Map<String, String> raw = Map.of(
                "q", "machine learning",
                "start", "0",
                "rows", "10",
                "api_key", "abc",
                "deep_search_limit", "1"
        );

        when(responseSpec.bodyToMono(ScopusResponse.class))
                .thenReturn(Mono.just(new ScopusResponse()));
        when(mapper.map(any())).thenReturn(List.of());

        scopusEngine.search(raw).block();

        ArgumentCaptor<URI> captor = ArgumentCaptor.forClass(URI.class);
        verify(requestHeadersUriSpec).uri(captor.capture());

        String uri = captor.getValue().toString();

        assertTrue(uri.contains("api.elsevier.com"));
        assertTrue(uri.contains("/content/search/scopus"));

        assertTrue(uri.contains("query=machine+learning"));
        assertTrue(uri.contains("start=0")); 
        assertTrue(uri.contains("count=10"));
        assertTrue(uri.contains("apiKey=abc"));
    }

    @Test
    void testMissingRequiredParamThrows() {
        Map<String, String> raw = Map.of(
                "q", "ai",
                "start", "0"
                // missing rows, missing api_key
        );

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> scopusEngine.search(raw)
        );

        assertTrue(ex.getMessage().contains("Missing or empty required parameter"));
        assertTrue(ex.getMessage().contains("rows"));
    }

    @Test
    void testPropagatesClientErrorButReturnsEmptyList() {
        Map<String, String> raw = Map.of(
                "q", "ai",
                "start", "0",
                "rows", "10",
                "api_key", "k",
                "deep_search_limit", "1"
        );

        when(responseSpec.bodyToMono(ScopusResponse.class))
                .thenReturn(Mono.error(new RuntimeException("API down")));

        StepVerifier.create(scopusEngine.search(raw))
                .assertNext(result -> assertTrue(result.getArticles().isEmpty()))
                .verifyComplete();
    }
}
