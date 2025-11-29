package pt.isec.literaturereviewhelper.engines;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;
import pt.isec.literaturereviewhelper.interfaces.IResultMapper;
import pt.isec.literaturereviewhelper.models.ArxivResponse;
import pt.isec.literaturereviewhelper.models.Article;

import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.net.URI;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ArxivEngineTest {

    @SuppressWarnings("rawtypes")
    private WebClient.RequestHeadersUriSpec requestHeadersUriSpec;
    private WebClient.RequestHeadersSpec requestHeadersSpec;
    private WebClient.ResponseSpec responseSpec;

    private IResultMapper<ArxivResponse> mapper;
    private ArxivEngine arxivEngine;

    @BeforeEach
    void setUp() {
        WebClient webClient = mock(WebClient.class);
        requestHeadersUriSpec = mock(WebClient.RequestHeadersUriSpec.class);
        requestHeadersSpec = mock(WebClient.RequestHeadersSpec.class);
        responseSpec = mock(WebClient.ResponseSpec.class);

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(URI.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.accept(any(MediaType.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);

        mapper = mock(IResultMapper.class);
        arxivEngine = new ArxivEngine(webClient, mapper);
    }

    @Test
    void testEngineName() {
        assertEquals("Arxiv", arxivEngine.getEngineName());
    }

    @Test
    void testMediaTypeIsAtomXml() {
        assertEquals(MediaType.APPLICATION_ATOM_XML, arxivEngine.getMediaType());
    }

    @Test
    void testMapParamsProducesCorrectValues() {
        Map<String, String> raw = Map.of(
                "q", "quantum computing",
                "start", "2",
                "rows", "25"
        );

        Map<String, Object> p = arxivEngine.mapParams(raw);

        assertEquals("all:quantum computing", p.get("search_query"));
        assertEquals(2 * 25, p.get("start"));
        assertEquals(25, p.get("max_results"));
    }

    @Test
    void testSearchSuccessMapsResponse() {
        Map<String, String> raw = Map.of(
                "q", "ai",
                "start", "0",
                "rows", "10"
        );

        ArxivResponse resp = new ArxivResponse();
        List<Article> mapped = List.of(
                new Article("Paper1", "2023", "", "", List.of(), "",
                        pt.isec.literaturereviewhelper.models.Engines.ARXIV)
        );

        when(responseSpec.bodyToMono(ArxivResponse.class)).thenReturn(Mono.just(resp));
        when(mapper.map(resp)).thenReturn(mapped);

        StepVerifier.create(arxivEngine.search(raw))
                .assertNext(result -> {
                    assertEquals(1, result.getArticles().size());
                    assertEquals("Paper1", result.getArticles().get(0).title());
                    assertEquals("2023", result.getArticles().get(0).publicationYear());
                    assertEquals(1, result.getStatistics().size());
                })
                .verifyComplete();
    }

    @Test
    void testBuildsCorrectUrlAndParams() {
        Map<String, String> raw = Map.of(
                "q", "deep learning",
                "start", "0",
                "rows", "10",
                "deep_search_limit", "1"
        );

        when(responseSpec.bodyToMono(ArxivResponse.class)).thenReturn(Mono.just(new ArxivResponse()));
        when(mapper.map(any())).thenReturn(List.of());

        arxivEngine.search(raw).block();

        ArgumentCaptor<URI> captor = ArgumentCaptor.forClass(URI.class);
        verify(requestHeadersUriSpec).uri(captor.capture());

        String uri = captor.getValue().toString();

        assertTrue(uri.contains("export.arxiv.org"));
        assertTrue(uri.contains("/api/query"));

        assertTrue(uri.contains("search_query=all%3Adeep+learning"));
        assertTrue(uri.contains("start=0"));   
        assertTrue(uri.contains("max_results=10"));
    }

    @Test
    void testMissingRequiredParamThrows() {
        Map<String, String> raw = Map.of(
                "q", "test",
                "start", "0",
                "deep_search_limit", "1"
                // missing rows
        );

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> arxivEngine.search(raw)
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
                "deep_search_limit", "1"
        );

        when(responseSpec.bodyToMono(ArxivResponse.class))
                .thenReturn(Mono.error(new RuntimeException("Network error")));

        StepVerifier.create(arxivEngine.search(raw))
                .assertNext(result -> assertTrue(result.getArticles().isEmpty()))
                .verifyComplete();
    }
}
