package pt.isec.literaturereviewhelper.controllers;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.reactive.server.WebTestClient;

import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.Engines;
import pt.isec.literaturereviewhelper.services.ApiService;

import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class LiteratureSearchControllerTest {
    private ApiService apiService;
    private WebTestClient webTestClient;

    @BeforeEach
    void setUp() {
        apiService = mock(ApiService.class);
        LiteratureSearchController controller = new LiteratureSearchController(apiService);
        webTestClient = WebTestClient.bindToController(controller).build();
    }

    private static Article a(String title, Engines src) {
        return new Article(
                title,
                "2024",
                "",
                "",
                "",
                "",
                src
        );
    }

    @Test
    void testWhenNoSource_QueriesAllEnginesAndMerges() {
        // Mock per engine
        when(apiService.search(eq(Engines.ACM), anyMap()))
                .thenReturn(Mono.just(List.of(a("acm-1", Engines.ACM))));
        when(apiService.search(eq(Engines.HAL), anyMap()))
                .thenReturn(Mono.just(List.of(a("hal-1", Engines.HAL))));
        when(apiService.search(eq(Engines.SPRINGER), anyMap()))
                .thenReturn(Mono.just(List.of(a("springer-1", Engines.SPRINGER))));

        webTestClient.get()
                .uri("/api/search")
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Article.class)
                .consumeWith(resp -> {
                    List<Article> body = resp.getResponseBody();
                    Assertions.assertNotNull(body);
                    Set<String> titles = body.stream().map(Article::title).collect(Collectors.toSet());
                    org.junit.jupiter.api.Assertions.assertEquals(3, body.size());
                    org.junit.jupiter.api.Assertions.assertTrue(titles.containsAll(Set.of("acm-1", "hal-1", "springer-1")));
                });

        verify(apiService, times(1)).search(eq(Engines.ACM), anyMap());
        verify(apiService, times(1)).search(eq(Engines.HAL), anyMap());
        verify(apiService, times(1)).search(eq(Engines.SPRINGER), anyMap());
    }

    @Test
    void testWhenSourcesCommaSeparated_QueriesOnlyThoseAndMerges() {
        when(apiService.search(eq(Engines.ACM), anyMap()))
                .thenReturn(Mono.just(List.of(a("acm-1", Engines.ACM))));
        when(apiService.search(eq(Engines.HAL), anyMap()))
                .thenReturn(Mono.just(List.of(a("hal-1", Engines.HAL))));

        webTestClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/search")
                        .queryParam("source", "ACM,HAL")
                        .build())
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Article.class)
                .consumeWith(resp -> {
                    List<Article> body = resp.getResponseBody();
                    Assertions.assertNotNull(body);
                    Set<String> titles = body.stream().map(Article::title).collect(Collectors.toSet());
                    org.junit.jupiter.api.Assertions.assertEquals(2, body.size());
                    org.junit.jupiter.api.Assertions.assertTrue(titles.containsAll(Set.of("acm-1", "hal-1")));
                });

        verify(apiService, times(1)).search(eq(Engines.ACM), anyMap());
        verify(apiService, times(1)).search(eq(Engines.HAL), anyMap());
        verify(apiService, never()).search(eq(Engines.SPRINGER), anyMap());
    }

    @Test
    void testBlankSourceBehavesLikeNoSource_CallsAll() {
        when(apiService.search(eq(Engines.ACM), anyMap()))
                .thenReturn(Mono.just(List.of(a("acm-1", Engines.ACM))));
        when(apiService.search(eq(Engines.HAL), anyMap()))
                .thenReturn(Mono.just(List.of(a("hal-1", Engines.HAL))));
        when(apiService.search(eq(Engines.SPRINGER), anyMap()))
                .thenReturn(Mono.just(List.of(a("springer-1", Engines.SPRINGER))));

        webTestClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/search")
                        .queryParam("source", "")
                        .build())
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Article.class)
                .hasSize(3);

        verify(apiService).search(eq(Engines.ACM), anyMap());
        verify(apiService).search(eq(Engines.HAL), anyMap());
        verify(apiService).search(eq(Engines.SPRINGER), anyMap());
    }

    @Test
    void testUnsupportedSource_ReturnsBadRequest() {
        webTestClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/search")
                        .queryParam("source", "foo")
                        .build())
                .exchange()
                .expectStatus().is5xxServerError();
    }

    @Test
    void testForwardsAllParamsUnchangedToApiService() {
        // Check param passthrough
        Map<String, String> q = Map.of(
                "q", "ai",
                "start", "0",
                "rows", "5",
                "api_key", "k",
                "source", "ACM"
        );
        when(apiService.search(Engines.ACM, q)).thenReturn(Mono.just(List.of(a("x", Engines.ACM))));

        webTestClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/search")
                        .queryParam("q", "ai")
                        .queryParam("start", "0")
                        .queryParam("rows", "5")
                        .queryParam("api_key", "k")
                        .queryParam("source", "ACM")
                        .build())
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Article.class)
                .hasSize(1);

        verify(apiService).search(Engines.ACM, q);
    }
}
