package pt.isec.literaturereviewhelper.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import pt.isec.literaturereviewhelper.dtos.SearchResponseDto;
import pt.isec.literaturereviewhelper.interfaces.IApiService;
import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.Engines;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.when;

class LiteratureReviewServiceTest {

    private LiteratureReviewService service;

    @Mock
    private IApiService apiService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new LiteratureReviewService(apiService);
    }

    private Article dummyArticle(Engines engine) {
        return new Article("", "", "", "", "", "", engine);
    }

    @Test
    void testPerformLiteratureSearchReturnsAggregatedCounts() {
        Map<String, String> allParams = new HashMap<>();
        allParams.put("q", "AI");

        Map<Engines, String> apiKeysByEngine = new HashMap<>();
        apiKeysByEngine.put(Engines.ACM, "key1");
        apiKeysByEngine.put(Engines.HAL, "key2");

        when(apiService.search(any(), any()))
                .thenAnswer(invocation -> {
                    Engines engine = invocation.getArgument(0);
                    if (engine == Engines.ACM) {
                        return Mono.just(List.of(dummyArticle(engine), dummyArticle(engine)));
                    } else if (engine == Engines.HAL) {
                        return Mono.just(List.of(dummyArticle(engine)));
                    } else {
                        return Mono.just(List.of());
                    }
                });

        Mono<SearchResponseDto> result = service.performLiteratureSearch(allParams, apiKeysByEngine);

        StepVerifier.create(result)
                .expectNextMatches(resp ->
                        resp.getQuery().equals("AI") &&
                        resp.getTotalArticles() == 3 &&
                        resp.getArticlesByEngine().get(Engines.ACM) == 2 &&
                        resp.getArticlesByEngine().get(Engines.HAL) == 1
                )
                .verifyComplete();
    }

    @Test
    void testPerformLiteratureSearchWithEmptySourceUsesAllEngines() {
        Map<String, String> allParams = new HashMap<>();
        allParams.put("q", "ML");
        allParams.put("source", "");
        Map<Engines, String> apiKeysByEngine = new HashMap<>();
        apiKeysByEngine.put(Engines.ACM, "key1");
        apiKeysByEngine.put(Engines.HAL, "key2");
        apiKeysByEngine.put(Engines.SPRINGER, "key3");

        when(apiService.search(any(), any()))
                .thenAnswer(invocation -> {
                    Engines engine = invocation.getArgument(0);
                    return Mono.just(List.of(dummyArticle(engine)));
                });

        Mono<SearchResponseDto> result = service.performLiteratureSearch(allParams, apiKeysByEngine);

        StepVerifier.create(result)
                .expectNextMatches(resp ->
                        resp.getArticlesByEngine().size() == 3 &&
                        resp.getTotalArticles() == 3
                )
                .verifyComplete();
    }

    @Test
    void testPerformLiteratureSearchWithEmptyListsFromApiService() {
        Map<String, String> allParams = new HashMap<>();
        allParams.put("q", "AI");
        Map<Engines, String> apiKeysByEngine = new HashMap<>();
        apiKeysByEngine.put(Engines.ACM, "key1");
        apiKeysByEngine.put(Engines.HAL, "key2");

        when(apiService.search(any(), any()))
                .thenReturn(Mono.just(List.of()));

        Mono<SearchResponseDto> result = service.performLiteratureSearch(allParams, apiKeysByEngine);

        StepVerifier.create(result)
                .expectNextMatches(resp ->
                        resp.getTotalArticles() == 0 &&
                        resp.getArticlesByEngine().get(Engines.ACM) == 0 &&
                        resp.getArticlesByEngine().get(Engines.HAL) == 0
                )
                .verifyComplete();
    }

    @Test
    void testPerformLiteratureSearchWithAllApiKeysNull() {
        Map<String, String> allParams = new HashMap<>();
        allParams.put("q", "AI");

        Map<Engines, String> apiKeysByEngine = new HashMap<>();
        apiKeysByEngine.put(Engines.ACM, null);
        apiKeysByEngine.put(Engines.HAL, null);
        apiKeysByEngine.put(Engines.SPRINGER, null);

        when(apiService.search(eq(Engines.ACM), any()))
                .thenReturn(Mono.just(List.of(dummyArticle(Engines.ACM), dummyArticle(Engines.ACM))));
        when(apiService.search(eq(Engines.HAL), any()))
                .thenReturn(Mono.just(List.of(dummyArticle(Engines.HAL))));
        when(apiService.search(eq(Engines.SPRINGER), any()))
                .thenReturn(Mono.just(List.of()));

        Mono<SearchResponseDto> result = service.performLiteratureSearch(allParams, apiKeysByEngine);

        StepVerifier.create(result)
                .expectNextMatches(resp ->
                        resp.getTotalArticles() == 3 &&
                        resp.getArticlesByEngine().get(Engines.ACM) == 2 &&
                        resp.getArticlesByEngine().get(Engines.HAL) == 1 &&
                        resp.getArticlesByEngine().get(Engines.SPRINGER) == 0
                )
                .verifyComplete();
    }

    @Test
    void testPerformLiteratureSearchServiceThrowsExceptionPropagated() {
        Map<String, String> allParams = new HashMap<>();
        allParams.put("q", "AI");
        Map<Engines, String> apiKeysByEngine = new HashMap<>();
        apiKeysByEngine.put(Engines.ACM, "key1");

        when(apiService.search(any(), any()))
                .thenReturn(Mono.error(new RuntimeException("API failed")));

        Mono<SearchResponseDto> result = service.performLiteratureSearch(allParams, apiKeysByEngine);

        StepVerifier.create(result)
                .expectErrorMatches(ex -> ex instanceof RuntimeException && ex.getMessage().equals("API failed"))
                .verify();
    }
}
