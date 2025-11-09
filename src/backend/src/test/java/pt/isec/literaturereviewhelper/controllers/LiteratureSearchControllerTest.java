package pt.isec.literaturereviewhelper.controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.util.Assert;

import pt.isec.literaturereviewhelper.commons.RequestHeaderUtils;
import pt.isec.literaturereviewhelper.dtos.SearchResponseDto;
import pt.isec.literaturereviewhelper.interfaces.ILiteratureReviewService;
import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.Engines;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.*;

class LiteratureSearchControllerTest {

    @Mock
    private ILiteratureReviewService literatureReviewService;

    @InjectMocks
    private LiteratureSearchController controller;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testConstructorCoverage() {
        LiteratureSearchController ctrl = new LiteratureSearchController(literatureReviewService);
        Assert.notNull(ctrl, "");
    }

    @Test
    void testSearch_WithApiKeysHeader() {

        Map<String, String> params = new HashMap<>();
        params.put("q", "AI");
        params.put("source", "google,reddit");

        String apiKeysHeader = "google=key1,reddit=key2";

        Map<Engines, String> apiKeysByEngine = Map.of(
                Engines.ACM, "key1",
                Engines.HAL, "key2"
        );

        List<Article> articles = List.of(new Article("Title 1", "Author 1", apiKeysHeader, apiKeysHeader, List.of(apiKeysHeader), apiKeysHeader, null), new Article("Title 2", "Author 2", apiKeysHeader, apiKeysHeader, List.of(apiKeysHeader), apiKeysHeader, null));
        Map<Engines, Integer> articlesByEngine = Map.of(
                Engines.ACM, 5,
                Engines.HAL, 3
        );

        SearchResponseDto expectedResponse = new SearchResponseDto(
                "AI",
                8,
                articlesByEngine,
                articles
        );

        try (MockedStatic<RequestHeaderUtils> mocked = mockStatic(RequestHeaderUtils.class)) {
            mocked.when(() -> RequestHeaderUtils.parseApiKeysHeader(apiKeysHeader))
                    .thenReturn(apiKeysByEngine);

            when(literatureReviewService.performLiteratureSearch(params, apiKeysByEngine))
                    .thenReturn(Mono.just(expectedResponse));


            Mono<SearchResponseDto> result = controller.search(params, apiKeysHeader);


            StepVerifier.create(result)
                    .expectNextMatches(resp ->
                            resp.getQuery().equals("AI") &&
                            resp.getTotalArticles() == 8 &&
                            resp.getArticlesByEngine().equals(articlesByEngine) &&
                            resp.getArticles().equals(articles)
                    )
                    .verifyComplete();

            verify(literatureReviewService, times(1))
                    .performLiteratureSearch(params, apiKeysByEngine);
        }
    }

    @Test
    void testSearch_WithoutApiKeysHeader() {

        Map<String, String> params = Map.of("q", "machine learning");
        Map<Engines, String> emptyKeys = new EnumMap<>(Engines.class);

        List<Article> articles = List.of(new Article("ML Basics", "Author X", null, null, null, null, null));
        Map<Engines, Integer> articlesByEngine = Map.of(Engines.HAL, 1);

        SearchResponseDto expectedResponse = new SearchResponseDto(
                "machine learning",
                1,
                articlesByEngine,
                articles
        );

        try (MockedStatic<RequestHeaderUtils> mocked = mockStatic(RequestHeaderUtils.class)) {
            mocked.when(() -> RequestHeaderUtils.parseApiKeysHeader(null))
                    .thenReturn(emptyKeys);

            when(literatureReviewService.performLiteratureSearch(params, emptyKeys))
                    .thenReturn(Mono.just(expectedResponse));


            Mono<SearchResponseDto> result = controller.search(params, null);


            StepVerifier.create(result)
                    .expectNextMatches(resp ->
                            resp.getQuery().equals("machine learning") &&
                            resp.getTotalArticles() == 1 &&
                            resp.getArticlesByEngine().equals(articlesByEngine) &&
                            resp.getArticles().equals(articles)
                    )
                    .verifyComplete();

            verify(literatureReviewService, times(1))
                    .performLiteratureSearch(params, emptyKeys);
        }
    }
}
