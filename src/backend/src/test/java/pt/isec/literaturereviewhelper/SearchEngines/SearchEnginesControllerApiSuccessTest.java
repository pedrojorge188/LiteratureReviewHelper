package pt.isec.literaturereviewhelper.SearchEngines;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import pt.isec.literaturereviewhelper.controllers.LiteratureSearchController;
import pt.isec.literaturereviewhelper.model.Article;
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

    // ========================= SPRINGER =========================
    @Test
    void testSearchSpringer() {
        Article article = new Article(
                "Title1", "2023", "Springer Journal",
                "Journal", "John Doe", "http://link.com", "Springer"
        );

        when(apiService.searchAsync(anyString(), anyString(), anyMap(), eq(Map.class), any(), any()))
                .thenReturn(Mono.just(List.of(article)));

        List<Article> result = controller.searchSpringer("AI", 0, 10, "APIKEY").block();

        assertNotNull(result);
        assertEquals(1, result.size());
        Article a = result.get(0);
        assertEquals("Title1", a.getTitle());
        assertEquals("2023", a.getPublicationYear());
        assertEquals("Springer Journal", a.getVenue());
        assertEquals("Journal", a.getVenueType());
        assertEquals("John Doe", a.getAuthors());
        assertEquals("http://link.com", a.getLink());
        assertEquals("Springer", a.getSource());

        // Verify parameters passed to ApiService
        ArgumentCaptor<Map<String, Object>> captor = ArgumentCaptor.forClass(Map.class);
        verify(apiService).searchAsync(eq("https://api.springernature.com"),
                eq("/meta/v2/json"), captor.capture(), eq(Map.class), any(), any());
        Map<String, Object> params = captor.getValue();
        assertEquals("AI", params.get("q"));
        assertEquals(0, params.get("s"));
        assertEquals(10, params.get("p"));
        assertEquals("APIKEY", params.get("api_key"));
    }


    // ========================= HAL =========================
    @Test
    void testSearchHal() {
        Article article = new Article(
                "Title2", "2022", "HAL Conference",
                "Conference", "Jane Doe", "http://hal.link", "HAL"
        );

        when(apiService.searchAsync(anyString(), anyString(), anyMap(), eq(String.class), any(), any()))
                .thenReturn(Mono.just(List.of(article)));

        List<Article> result = controller.searchHal("ML", 0, 5, "json").block();

        assertNotNull(result);
        assertEquals(1, result.size());
        Article a = result.get(0);
        assertEquals("Title2", a.getTitle());
        assertEquals("2022", a.getPublicationYear());
        assertEquals("HAL Conference", a.getVenue());
        assertEquals("Conference", a.getVenueType());
        assertEquals("Jane Doe", a.getAuthors());
        assertEquals("http://hal.link", a.getLink());
        assertEquals("HAL", a.getSource());
    }


    // ========================= ACM =========================
    @Test
    void testSearchACM() {
        Article article = new Article(
                "Title3", "2021", "ACM Journal",
                "Journal", "Alice Smith", "http://acm.link", "ACM"
        );

        when(apiService.searchAsync(anyString(), anyString(), anyMap(), eq(Map.class), any(), any()))
                .thenReturn(Mono.just(List.of(article)));

        List<Article> result = controller.searchACM("Deep Learning", "filter1", 10, 0).block();

        assertNotNull(result);
        assertEquals(1, result.size());
        Article a = result.get(0);
        assertEquals("Title3", a.getTitle());
        assertEquals("2021", a.getPublicationYear());
        assertEquals("ACM Journal", a.getVenue());
        assertEquals("Journal", a.getVenueType());
        assertEquals("Alice Smith", a.getAuthors());
        assertEquals("http://acm.link", a.getLink());
        assertEquals("ACM", a.getSource());
    }

}
