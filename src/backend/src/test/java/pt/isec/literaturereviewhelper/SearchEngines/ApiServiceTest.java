package pt.isec.literaturereviewhelper.SearchEngines;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import pt.isec.literaturereviewhelper.factory.SearchEngineFactory;
import pt.isec.literaturereviewhelper.interfaces.ISearchEngine;
import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.Engines;
import pt.isec.literaturereviewhelper.services.ApiService;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Tests for ApiService facade
 */
class ApiServiceTest {

    private SearchEngineFactory factory;
    private ISearchEngine mockEngine;
    private ApiService apiService;

    @BeforeEach
    void setUp() {
        factory = mock(SearchEngineFactory.class);
        mockEngine = mock(ISearchEngine.class);
        apiService = new ApiService(factory);
    }

    @Test
    void testSearchWithSpringer() {
        // Arrange
        Map<String, Object> params = Map.of("q", "AI", "s", 0, "p", 10, "api_key", "KEY");
        Article expectedArticle = new Article(
                "Test Article", "2023", "Springer Journal",
                "Article", "John Doe", "http://example.com", "SpringerNature"
        );
        
        when(factory.createSearchEngine(Engines.SPRINGER)).thenReturn(mockEngine);
        when(mockEngine.search(params)).thenReturn(Mono.just(List.of(expectedArticle)));

        // Act
        List<Article> result = apiService.search(Engines.SPRINGER, params).block();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Test Article", result.get(0).getTitle());
        verify(factory).createSearchEngine(Engines.SPRINGER);
        verify(mockEngine).search(params);
    }

    @Test
    void testSearchWithHAL() {
        // Arrange
        Map<String, Object> params = Map.of("q", "ML", "start", 0, "rows", 10, "wt", "bibtex");
        Article expectedArticle = new Article(
                "HAL Paper", "2022", "HAL Conference",
                "Conference", "Jane Doe", "http://hal.link", "HAL Open Science"
        );
        
        when(factory.createSearchEngine(Engines.HAL)).thenReturn(mockEngine);
        when(mockEngine.search(params)).thenReturn(Mono.just(List.of(expectedArticle)));

        // Act
        List<Article> result = apiService.search(Engines.HAL, params).block();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("HAL Paper", result.get(0).getTitle());
        verify(factory).createSearchEngine(Engines.HAL);
        verify(mockEngine).search(params);
    }

    @Test
    void testSearchWithACM() {
        // Arrange
        Map<String, Object> params = Map.of(
                "query.bibliographic", "Deep Learning",
                "offset", 0,
                "rows", 10
        );
        Article expectedArticle = new Article(
                "ACM Paper", "2021", "ACM Journal",
                "Journal", "Alice Smith", "http://acm.link", "ACM Digital Library"
        );
        
        when(factory.createSearchEngine(Engines.ACM)).thenReturn(mockEngine);
        when(mockEngine.search(params)).thenReturn(Mono.just(List.of(expectedArticle)));

        // Act
        List<Article> result = apiService.search(Engines.ACM, params).block();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("ACM Paper", result.get(0).getTitle());
        verify(factory).createSearchEngine(Engines.ACM);
        verify(mockEngine).search(params);
    }

    @Test
    void testSearchDelegatesCorrectly() {
        // Verify that ApiService properly delegates to the factory
        Map<String, Object> params = Map.of("test", "value");
        
        when(factory.createSearchEngine(any())).thenReturn(mockEngine);
        when(mockEngine.search(any())).thenReturn(Mono.just(List.of()));

        apiService.search(Engines.SPRINGER, params).block();

        verify(factory, times(1)).createSearchEngine(Engines.SPRINGER);
        verify(mockEngine, times(1)).search(params);
    }
}
