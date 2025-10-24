package pt.isec.literaturereviewhelper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.reactive.server.WebTestClient;
import pt.isec.literaturereviewhelper.controllers.SearchEnginesController;
import pt.isec.literaturereviewhelper.model.Article;
import pt.isec.literaturereviewhelper.services.ApiService;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@WebFluxTest(controllers = SearchEnginesController.class)
class SearchEnginesControllerTest {


    @Autowired
    private WebTestClient webClient;

    @MockitoBean
    private ApiService apiService;

    private List<Article> sampleArticles;

    @BeforeEach
    void setUp() {
        sampleArticles = List.of(
                new Article("Title 1", "2020", "Journal 1", "Journal Article", "Author 1", "http://link1.com", "SpringerNature"),
                new Article("Title 2", "2021", "Journal 2", "Journal Article", "Author 2", "http://link2.com", "SpringerNature")
        );
    }

    @Test
    void testSearchSpringerSuccess() {
        Mockito.when(apiService.searchAsync(
                        Mockito.anyString(),
                        Mockito.anyString(),
                        Mockito.anyMap(),
                        Mockito.eq(Map.class),
                        Mockito.any(),
                        Mockito.eq(MediaType.APPLICATION_JSON)
                ))
                .thenReturn(Mono.just(sampleArticles));

        webClient.get()
                .uri(uriBuilder -> uriBuilder.path("/api/searchSpringer")
                        .queryParam("q", "AI")
                        .queryParam("s", 0)
                        .queryParam("p", 2)
                        .queryParam("api_key", "dummyKey")
                        .build())
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Article.class)
                .hasSize(2)
                .contains(sampleArticles.get(0), sampleArticles.get(1));
    }

    @Test
    void testSearchSpringerValidationError_emptyQuery() {
        webClient.get()
                .uri(uriBuilder -> uriBuilder.path("/api/searchSpringer")
                        .queryParam("q", "")
                        .queryParam("s", 0)
                        .queryParam("p", 2)
                        .queryParam("api_key", "dummyKey")
                        .build())
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody()
                .jsonPath("$.q").isEqualTo("Query string 'q' is empty");
    }

    @Test
    void testSearchHalSuccess() {
        Mockito.when(apiService.searchAsync(
                        Mockito.anyString(),
                        Mockito.anyString(),
                        Mockito.anyMap(),
                        Mockito.eq(String.class),
                        Mockito.any(),
                        Mockito.eq(MediaType.TEXT_PLAIN)
                ))
                .thenReturn(Mono.just(sampleArticles));

        webClient.get()
                .uri(uriBuilder -> uriBuilder.path("/api/searchHal")
                        .queryParam("q", "AI")
                        .queryParam("start", 0)
                        .queryParam("rows", 2)
                        .queryParam("wt", "json")
                        .build())
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Article.class)
                .hasSize(2)
                .contains(sampleArticles.get(0), sampleArticles.get(1));
    }

    @Test
    void testSearchACMSuccess() {
        Mockito.when(apiService.searchAsync(
                        Mockito.anyString(),
                        Mockito.anyString(),
                        Mockito.anyMap(),
                        Mockito.eq(Map.class),
                        Mockito.any(),
                        Mockito.eq(MediaType.APPLICATION_JSON)
                ))
                .thenReturn(Mono.just(sampleArticles));

        webClient.get()
                .uri(uriBuilder -> uriBuilder.path("/api/searchACM")
                        .queryParam("querybibliographic", "AI")
                        .queryParam("filter", "filter1")
                        .queryParam("rows", 2)
                        .queryParam("offset", 0)
                        .build())
                .accept(MediaType.APPLICATION_JSON)
                .exchange()
                .expectStatus().isOk()
                .expectBodyList(Article.class)
                .hasSize(2)
                .contains(sampleArticles.get(0), sampleArticles.get(1));
    }
}
