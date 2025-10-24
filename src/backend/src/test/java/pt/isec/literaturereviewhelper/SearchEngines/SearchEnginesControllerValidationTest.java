package pt.isec.literaturereviewhelper.SearchEngines;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.junit.jupiter.api.Test;
import pt.isec.literaturereviewhelper.services.ApiService;
import pt.isec.literaturereviewhelper.controllers.SearchEnginesController;

@WebFluxTest(controllers = SearchEnginesController.class)
class SearchEnginesControllerValidationTest {

    @Autowired
    private WebTestClient webClient;

    @MockitoBean
    private ApiService apiService;


    // ---------------- SPRINGER ----------------
    @Test
    void testSpringer_EmptyQuery() {
        webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/searchSpringer")
                        .queryParam("q", "")
                        .queryParam("s", 0)
                        .queryParam("p", 1)
                        .queryParam("api_key", "APIKEY")
                        .build())
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody()
                .jsonPath("$.q").isEqualTo("Query string 'q' is empty");
    }

    @Test
    void testSpringerInvalidIndexAndCount() {
        // s < 0
        webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/searchSpringer")
                        .queryParam("q", "AI")
                        .queryParam("s", -1)
                        .queryParam("p", 1)
                        .queryParam("api_key", "APIKEY")
                        .build())
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody()
                .jsonPath("$.s").isEqualTo("article index 's' must be >= 0");

        // p < 1
        webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/searchSpringer")
                        .queryParam("q", "AI")
                        .queryParam("s", 0)
                        .queryParam("p", 0)
                        .queryParam("api_key", "APIKEY")
                        .build())
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody()
                .jsonPath("$.p").isEqualTo("Number of articles 'p' must be > 0");

        // empty api_key
        webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/searchSpringer")
                        .queryParam("q", "AI")
                        .queryParam("s", 0)
                        .queryParam("p", 1)
                        .queryParam("api_key", "")
                        .build())
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody()
                .jsonPath("$.api_key").isEqualTo("API key is empty");
    }

    // ---------------- HAL ----------------
    @Test
    void testHal_ValidationErrors() {
        // empty query
        webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/searchHal")
                        .queryParam("q", "")
                        .queryParam("start", 0)
                        .queryParam("rows", 1)
                        .queryParam("wt", "json")
                        .build())
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody()
                .jsonPath("$.q").isEqualTo("Query 'q' is empty");

        // start < 0
        webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/searchHal")
                        .queryParam("q", "ML")
                        .queryParam("start", -1)
                        .queryParam("rows", 1)
                        .queryParam("wt", "json")
                        .build())
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody()
                .jsonPath("$.start").isEqualTo("'start' must be >= 0");

        // rows < 1
        webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/searchHal")
                        .queryParam("q", "ML")
                        .queryParam("start", 0)
                        .queryParam("rows", 0)
                        .queryParam("wt", "json")
                        .build())
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody()
                .jsonPath("$.rows").isEqualTo("'rows' must be > 0");

        // empty wt
        webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/searchHal")
                        .queryParam("q", "ML")
                        .queryParam("start", 0)
                        .queryParam("rows", 1)
                        .queryParam("wt", "")
                        .build())
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody()
                .jsonPath("$.wt").isEqualTo("Parameter 'wt' is empty");
    }

    // ---------------- ACM ----------------
    @Test
    void testACM_ValidationErrors() {
        // empty querybibliographic
        webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/searchACM")
                        .queryParam("querybibliographic", "")
                        .queryParam("filter", "f")
                        .queryParam("rows", 1)
                        .queryParam("offset", 0)
                        .build())
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody()
                .jsonPath("$.querybibliographic").isEqualTo("'querybibliographic' is empty");

        // empty filter
        webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/searchACM")
                        .queryParam("querybibliographic", "DL")
                        .queryParam("filter", "")
                        .queryParam("rows", 1)
                        .queryParam("offset", 0)
                        .build())
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody()
                .jsonPath("$.filter").isEqualTo("'filter' is empty");

        // rows < 1
        webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/searchACM")
                        .queryParam("querybibliographic", "DL")
                        .queryParam("filter", "f")
                        .queryParam("rows", 0)
                        .queryParam("offset", 0)
                        .build())
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody()
                .jsonPath("$.rows").isEqualTo("'rows' must be > 0");

        // offset < 0
        webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/searchACM")
                        .queryParam("querybibliographic", "DL")
                        .queryParam("filter", "f")
                        .queryParam("rows", 1)
                        .queryParam("offset", -1)
                        .build())
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody()
                .jsonPath("$.offset").isEqualTo("'offset' must be >= 0");
    }
}
