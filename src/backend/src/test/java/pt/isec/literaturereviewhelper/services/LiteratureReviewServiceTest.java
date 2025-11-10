package pt.isec.literaturereviewhelper.services;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import pt.isec.literaturereviewhelper.dtos.SearchResponseDto;
import pt.isec.literaturereviewhelper.interfaces.IApiService;
import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.Engines;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class LiteratureReviewServiceTest {

    @Mock
    private IApiService apiService;

    private LiteratureReviewService service;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new LiteratureReviewService(apiService);
    }

    @Test
    void testConstructorCoverage() {
        LiteratureReviewService s = new LiteratureReviewService(apiService);
        assertNotNull(s);
    }

    @Test
    void testPerformSearch_WithValidSources_AndApiKeys() {

        Map<String, String> params = new HashMap<>();
        params.put("q", "AI");
        params.put("source", "HAL,ACM");

        Map<Engines, String> apiKeys = Map.of(
                Engines.HAL, "key1",
                Engines.ACM, "key2"
        );

        List<Article> googleArticles = List.of(
                new Article("Google AI", "Author G1", "http://g1", "Google", List.of(), "", Engines.ACM),
                new Article("DeepMind", "Author G2", "http://g2", "Google", List.of(), "", Engines.HAL)
        );

        List<Article> redditArticles = List.of(
                new Article("Reddit AI Discussion", "Author R1", "http://r1", "Reddit", List.of(), "",Engines.HAL)
        );

        when(apiService.search(eq(Engines.HAL), any()))
                .thenReturn(Mono.just(googleArticles));
        when(apiService.search(eq(Engines.ACM), any()))
                .thenReturn(Mono.just(redditArticles));


        Mono<SearchResponseDto> result = service.performLiteratureSearch(params, apiKeys);


        StepVerifier.create(result)
                .assertNext(resp -> {
                    assertEquals("AI", resp.getQuery());
                    assertEquals(3, resp.getTotalArticles());
                    assertEquals(2, resp.getArticlesByEngine().size());
                    assertEquals(3, resp.getArticles().size());
                    assertTrue(resp.getArticlesByEngine().containsKey(Engines.HAL));
                    assertTrue(resp.getArticlesByEngine().containsKey(Engines.ACM));
                })
                .verifyComplete();

        verify(apiService, times(1)).search(eq(Engines.HAL), any());
        verify(apiService, times(1)).search(eq(Engines.ACM), any());
    }

    @Test
    void testPerformSearch_WithNullSource_UsesAllEngines() {

        Map<String, String> params = new HashMap<>();
        params.put("q", "test");

        Map<Engines, String> apiKeys = new EnumMap<>(Engines.class);

        for (Engines e : Engines.values()) {
            when(apiService.search(eq(e), any())).thenReturn(Mono.just(List.of()));
        }


        Mono<SearchResponseDto> result = service.performLiteratureSearch(params, apiKeys);


        StepVerifier.create(result)
                .assertNext(resp -> {
                    assertEquals("test", resp.getQuery());
                    assertTrue(resp.getArticles().isEmpty());
                    assertEquals(Engines.values().length, resp.getArticlesByEngine().size());
                })
                .verifyComplete();

        for (Engines e : Engines.values()) {
            verify(apiService, atLeastOnce()).search(eq(e), any());
        }
    }

   @Test
   void testPerformSearch_WithInvalidSource_ThrowsException() {
        Map<String, String> params = new HashMap<>();
        params.put("q", "AI");
        params.put("source", "invalidEngine");

        Map<Engines, String> apiKeys = new EnumMap<>(Engines.class);

        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> service.performLiteratureSearch(params, apiKeys)
        );

        assertEquals("Unsupported source: invalidEngine", exception.getMessage());
    }

    @Test
    void testPerformSearch_WithMissingApiKey_DoesNotBreak() {

        Map<String, String> params = new HashMap<>();
        params.put("q", "AI");
        params.put("source", "HAL");

        Map<Engines, String> apiKeys = new EnumMap<>(Engines.class);
        List<Article> googleArticles = List.of(
                new Article("A1", "Auth1", "http://a1", "Google", List.of(), "", Engines.HAL)
        );

        when(apiService.search(eq(Engines.HAL), any()))
                .thenReturn(Mono.just(googleArticles));


        Mono<SearchResponseDto> result = service.performLiteratureSearch(params, apiKeys);


        StepVerifier.create(result)
                .assertNext(resp -> {
                    assertEquals("AI", resp.getQuery());
                    assertEquals(1, resp.getTotalArticles());
                    assertEquals(1, resp.getArticlesByEngine().get(Engines.HAL));
                    assertEquals(1, resp.getArticles().size());
                })
                .verifyComplete();
    }

    @Test
    void testPerformSearch_RemoveDuplicatedArticles() {
        // Arrange
        Map<String, String> params = new HashMap<>();
        params.put("q", "Distributed Systems");
        params.put("source", "HAL,ACM");

        Map<Engines, String> apiKeys = Map.of(
                Engines.HAL, "key1",
                Engines.ACM, "key2"
        );

        // Articles that should be considered duplicated articles after processing
        Article commonArticleHal = new Article("Distributed Systems Overview!", "2023", "Journal of DS", "Journal", "John Doe", "http://example.com/ds-overview-hal", Engines.HAL);
        Article commonArticleAcm = new Article("distributed systems overview", "2023", "Journal of DS", "Journal", "John Doe", "http://example.com/ds-overview-acm", Engines.ACM);

        Article uniqueHalArticle = new Article("HAL Specific Article", "2022", "HAL Journal", "Conference", "Jane Smith", "http://example.com/hal-specific", Engines.HAL);
        Article uniqueAcmArticle = new Article("ACM Specific Article", "2021", "ACM Transactions", "Journal", "Peter Jones", "http://example.com/acm-specific", Engines.ACM);

        List<Article> halArticles = List.of(commonArticleHal, uniqueHalArticle);
        List<Article> acmArticles = List.of(commonArticleAcm, uniqueAcmArticle);

        when(apiService.search(eq(Engines.HAL), any()))
                .thenReturn(Mono.just(halArticles));
        when(apiService.search(eq(Engines.ACM), any()))
                .thenReturn(Mono.just(acmArticles));

        // Act
        Mono<SearchResponseDto> result = service.performLiteratureSearch(params, apiKeys);

        // Assert
        StepVerifier.create(result)
                .assertNext(resp -> {
                    assertEquals("Distributed Systems", resp.getQuery());
                    assertEquals(3, resp.getTotalArticles()); // Expect 3 unique articles after deduplication
                    assertEquals(3, resp.getArticles().size()); // Expect 3 unique articles in the list

                    // Verify that the unique articles are present
                    assertTrue(resp.getArticles().contains(uniqueHalArticle));
                    assertTrue(resp.getArticles().contains(uniqueAcmArticle));

                    // Verify that one of the common articles is present (either HAL or ACM version)
                    // Since putIfAbsent is used, the first one encountered will be kept.
                    // We can't guarantee which one, so we check if either is present.
                    assertTrue(resp.getArticles().contains(commonArticleHal) || resp.getArticles().contains(commonArticleAcm));

                    // Verify removed articles duplicated count
                    assertEquals(1, resp.getArticlesDuplicatedRemoved());
                })
                .verifyComplete();

        verify(apiService, times(1)).search(eq(Engines.HAL), any());
        verify(apiService, times(1)).search(eq(Engines.ACM), any());
    }
}
