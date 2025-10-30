package pt.isec.literaturereviewhelper.engines;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

import pt.isec.literaturereviewhelper.interfaces.IResultMapper;
import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.SpringerResponse;

import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.net.URI;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class SpringerEngineTest {
    @SuppressWarnings("rawtypes")
    private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;
    private WebClient.ResponseSpec responseSpec;

    private IResultMapper<SpringerResponse> resultMapper;
    private SpringerEngine springerEngine;

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

        resultMapper = mock(IResultMapper.class);
        springerEngine = new SpringerEngine(webClient, resultMapper);
    }

    @Test
    void testGetEngineName() {
        assertEquals("Springer", springerEngine.getEngineName());
    }

    @Test
    void testSearchSuccessMapsResponse() {
        // Assert
        Map<String, String> raw = Map.of(
                "q", "artificial intelligence",
                "start", "0",
                "rows", "10",
                "api_key", "test-key",
                "deep_search_limit", "1"
        );

        SpringerResponse resp = new SpringerResponse();
        SpringerResponse.Record rec = new SpringerResponse.Record();
        rec.setTitle("AI Research Paper");
        rec.setPublicationDate("2024-01-15");
        resp.setRecords(List.of(rec));

        List<Article> mapped = List.of(new Article(
                "AI Research Paper", "2024", "", "",
                List.of(), "", pt.isec.literaturereviewhelper.models.Engines.SPRINGER
        ));

        when(responseSpec.bodyToMono(SpringerResponse.class)).thenReturn(Mono.just(resp));
        when(resultMapper.map(resp)).thenReturn(mapped);

        Mono<List<Article>> out = springerEngine.search(raw);

        StepVerifier.create(out)
                .assertNext(list -> {
                    assertEquals(1, list.size());
                    assertEquals("AI Research Paper", list.get(0).title());
                    assertEquals("2024", list.get(0).publicationYear());
                })
                .verifyComplete();
    }

    @Test
    void testBuildsCorrectUrlAndUsesMappedParams() {
        Map<String, String> raw = Map.of(
                "q", "machine learning",
                "start", "0",
                "rows", "5",
                "api_key", "abc123",
                "deep_search_limit", "1"
        );

        when(responseSpec.bodyToMono(SpringerResponse.class))
                .thenReturn(Mono.just(new SpringerResponse()));
        when(resultMapper.map(any())).thenReturn(List.of());

        springerEngine.search(raw).block();

        ArgumentCaptor<URI> captor = ArgumentCaptor.forClass(URI.class);
        verify(requestHeadersUriSpec).uri(captor.capture());
        String uri = captor.getValue().toString();

        assertTrue(uri.contains("api.springernature.com"));
        assertTrue(uri.contains("/meta/v2/json"));

        assertTrue(uri.contains("q=machine+learning"));
        assertTrue(uri.contains("s=0"));
        assertTrue(uri.contains("p=5"));
        assertTrue(uri.contains("api_key=abc123"));
    }

    @Test
    void testMissingRequiredParamThrows() {
        Map<String, String> raw = Map.of(
                "q", "ai",
                "start", "0",
                // rows missing
                "api_key", "k",
                "deep_search_limit", "1"
        );

        // .search() will throw because we have validateParams() on the engine itself
        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> springerEngine.search(raw)
        );
        assertTrue(ex.getMessage().contains("Missing or empty required parameter 'rows' for Springer"));
    }

    @Test
    void testPropagatesClientError() {
        Map<String, String> raw = Map.of(
                "q", "ai",
                "start", "0",
                "rows", "5",
                "api_key", "k",
                "deep_search_limit", "1"
        );

        when(responseSpec.bodyToMono(SpringerResponse.class))
                .thenReturn(Mono.error(new RuntimeException("API Error")));

        StepVerifier.create(springerEngine.search(raw))
                .expectNextMatches(list -> list.isEmpty()) // retorna lista vazia
                .verifyComplete();
    }
}
