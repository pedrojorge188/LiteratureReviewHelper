package pt.isec.literaturereviewhelper.SearchEngines;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import pt.isec.literaturereviewhelper.controllers.LiteratureSearchController;
import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.Engines;
import pt.isec.literaturereviewhelper.services.ApiService;
import reactor.core.publisher.Mono;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class LiteratureSearchControllerApiSuccessTest {

    private ApiService apiService;
    private LiteratureSearchController controller;

    @BeforeEach
    void setUp() {
        apiService = mock(ApiService.class);
        controller = new LiteratureSearchController(apiService);
    }

    // ========================= GENERIC /search ENDPOINT =========================
    @Test
    void testSearchWithSpringerSource() {
        Article article = new Article(
                "Title1", "2023", "Springer Journal",
                "Journal", "John Doe", "http://link.com", "SpringerNature"
        );

        when(apiService.search(eq(Engines.SPRINGER), anyMap()))
                .thenReturn(Mono.just(List.of(article)));

        Map<String, String> params = Map.of(
                "source", "springer",
                "q", "AI",
                "start", "0",
                "rows", "10",
                "api_key", "APIKEY"
        );

        List<Article> result = controller.search(params).block();

        assertNotNull(result);
        assertEquals(1, result.size());
        Article a = result.get(0);
        assertEquals("Title1", a.getTitle());
        assertEquals("2023", a.getPublicationYear());
        assertEquals("Springer Journal", a.getVenue());

        // Verify engine and params
        @SuppressWarnings("unchecked")
        ArgumentCaptor<Map<String, Object>> captor = ArgumentCaptor.forClass(Map.class);
        verify(apiService).search(eq(Engines.SPRINGER), captor.capture());
        Map<String, Object> engineParams = captor.getValue();
        assertEquals("AI", engineParams.get("q"));
        assertEquals(0, engineParams.get("s")); // mapped to 's'
        assertEquals(10, engineParams.get("p")); // mapped to 'p'
        assertEquals("APIKEY", engineParams.get("api_key"));
    }

    @Test
    void testSearchWithHALSource() {
        Article article = new Article(
                "Title2", "2022", "HAL Conference",
                "Conference", "Jane Doe", "http://hal.link", "HAL Open Science"
        );

        when(apiService.search(eq(Engines.HAL), anyMap()))
                .thenReturn(Mono.just(List.of(article)));

        Map<String, String> params = Map.of(
                "source", "hal",
                "q", "ML",
                "start", "0",
                "rows", "5",
                "wt", "bibtex"
        );

        List<Article> result = controller.search(params).block();

        assertNotNull(result);
        assertEquals(1, result.size());
        Article a = result.get(0);
        assertEquals("Title2", a.getTitle());

        verify(apiService).search(eq(Engines.HAL), anyMap());
    }

    @Test
    void testSearchWithACMSource() {
        Article article = new Article(
                "Title3", "2021", "ACM Journal",
                "Journal", "Alice Smith", "http://acm.link", "ACM Digital Library"
        );

        when(apiService.search(eq(Engines.ACM), anyMap()))
                .thenReturn(Mono.just(List.of(article)));

        Map<String, String> params = Map.of(
                "source", "acm",
                "q", "Deep Learning",
                "start", "0",
                "rows", "10"
        );

        List<Article> result = controller.search(params).block();

        assertNotNull(result);
        assertEquals(1, result.size());
        Article a = result.get(0);
        assertEquals("Title3", a.getTitle());

        // Verify ACM-specific param mapping
        @SuppressWarnings("unchecked")
        ArgumentCaptor<Map<String, Object>> captor = ArgumentCaptor.forClass(Map.class);
        verify(apiService).search(eq(Engines.ACM), captor.capture());
        Map<String, Object> engineParams = captor.getValue();
        assertEquals("Deep Learning", engineParams.get("query.bibliographic"));
        assertEquals(0, engineParams.get("offset")); // mapped to 'offset'
        assertEquals(10, engineParams.get("rows"));
    }

    // ========================= DEPRECATED ENDPOINTS =========================
    @SuppressWarnings("deprecation")
    @Test
    void testSearchSpringer_Deprecated() {
        Article article = new Article(
                "Title1", "2023", "Springer Journal",
                "Journal", "John Doe", "http://link.com", "SpringerNature"
        );

        when(apiService.search(eq(Engines.SPRINGER), anyMap()))
                .thenReturn(Mono.just(List.of(article)));

        List<Article> result = controller.searchSpringer("AI", 0, 10, "APIKEY").block();

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(apiService).search(eq(Engines.SPRINGER), anyMap());
    }

    @SuppressWarnings("deprecation")
    @Test
    void testSearchHal_Deprecated() {
        Article article = new Article(
                "Title2", "2022", "HAL Conference",
                "Conference", "Jane Doe", "http://hal.link", "HAL Open Science"
        );

        when(apiService.search(eq(Engines.HAL), anyMap()))
                .thenReturn(Mono.just(List.of(article)));

        List<Article> result = controller.searchHal("ML", 0, 5, "bibtex").block();

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(apiService).search(eq(Engines.HAL), anyMap());
    }

    @SuppressWarnings("deprecation")
    @Test
    void testSearchACM_Deprecated() {
        Article article = new Article(
                "Title3", "2021", "ACM Journal",
                "Journal", "Alice Smith", "http://acm.link", "ACM Digital Library"
        );

        when(apiService.search(eq(Engines.ACM), anyMap()))
                .thenReturn(Mono.just(List.of(article)));

        List<Article> result = controller.searchACM("Deep Learning", "filter1", 10, 0).block();

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(apiService).search(eq(Engines.ACM), anyMap());
    }
}
