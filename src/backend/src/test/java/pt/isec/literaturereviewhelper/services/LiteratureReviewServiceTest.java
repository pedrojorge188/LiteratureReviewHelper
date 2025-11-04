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
        // Arrange
        Map<String, String> params = new HashMap<>();
        params.put("q", "AI");
        params.put("source", "HAL,ACM");

        Map<Engines, String> apiKeys = Map.of(
                Engines.HAL, "key1",
                Engines.ACM, "key2"
        );

        List<Article> googleArticles = List.of(
                new Article("Google AI", "Author G1", "http://g1", "Google", "", "", Engines.ACM),
                new Article("DeepMind", "Author G2", "http://g2", "Google", "", "", Engines.HAL)
        );

        List<Article> redditArticles = List.of(
                new Article("Reddit AI Discussion", "Author R1", "http://r1", "Reddit", "", "",Engines.HAL)
        );

        when(apiService.search(eq(Engines.HAL), any()))
                .thenReturn(Mono.just(googleArticles));
        when(apiService.search(eq(Engines.ACM), any()))
                .thenReturn(Mono.just(redditArticles));

        // Act
        Mono<SearchResponseDto> result = service.performLiteratureSearch(params, apiKeys);

        // Assert
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
        // Arrange
        Map<String, String> params = new HashMap<>();
        params.put("q", "test");

        Map<Engines, String> apiKeys = new EnumMap<>(Engines.class);

        for (Engines e : Engines.values()) {
            when(apiService.search(eq(e), any())).thenReturn(Mono.just(List.of()));
        }

        // Act
        Mono<SearchResponseDto> result = service.performLiteratureSearch(params, apiKeys);

        // Assert
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
        // Arrange
        Map<String, String> params = new HashMap<>();
        params.put("q", "AI");
        params.put("source", "invalidEngine"); // valor inválido
    
        Map<Engines, String> apiKeys = new EnumMap<>(Engines.class);
    
        // Act & Assert
        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> service.performLiteratureSearch(params, apiKeys).block()
        );
    
        // Verifica a mensagem
        assertEquals("Unsupported source: invalidEngine", exception.getMessage());
    }

    @Test
    void testPerformSearch_WithMissingApiKey_DoesNotBreak() {
        // Arrange
        Map<String, String> params = new HashMap<>();
        params.put("q", "AI");
        params.put("source", "HAL");

        Map<Engines, String> apiKeys = new EnumMap<>(Engines.class); // missing key

        List<Article> googleArticles = List.of(
                new Article("A1", "Auth1", "http://a1", "Google", "", "", Engines.HAL)
        );

        when(apiService.search(eq(Engines.HAL), any()))
                .thenReturn(Mono.just(googleArticles));

        // Act
        Mono<SearchResponseDto> result = service.performLiteratureSearch(params, apiKeys);

        // Assert
        StepVerifier.create(result)
                .assertNext(resp -> {
                    assertEquals("AI", resp.getQuery());
                    assertEquals(1, resp.getTotalArticles());
                    assertEquals(1, resp.getArticlesByEngine().get(Engines.HAL));
                    assertEquals(1, resp.getArticles().size());
                })
                .verifyComplete();
    }
}
