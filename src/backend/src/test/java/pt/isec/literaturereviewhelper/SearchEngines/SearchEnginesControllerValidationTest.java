package pt.isec.literaturereviewhelper.SearchEngines;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.junit.jupiter.api.Test;
import pt.isec.literaturereviewhelper.services.ApiService;
import pt.isec.literaturereviewhelper.controllers.LiteratureSearchController;

@WebFluxTest(controllers = LiteratureSearchController.class)
class LiteratureSearchControllerValidationTest {

    @Autowired
    private WebTestClient webClient;

    @MockitoBean
    private ApiService apiService;

    // ---------------- GENERIC /search ENDPOINT ----------------
    @Test
    void testSearch_MissingSource() {
        webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/search")
                        .queryParam("q", "AI")
                        .queryParam("start", "0")
                        .queryParam("rows", "10")
                        .build())
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody()
                .jsonPath("$.error").value(msg -> 
                    msg.toString().contains("Parameter 'source' is required"));
    }

    @Test
    void testSearch_InvalidSource() {
        webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/search")
                        .queryParam("source", "invalid")
                        .queryParam("q", "AI")
                        .queryParam("start", "0")
                        .queryParam("rows", "10")
                        .build())
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody()
                .jsonPath("$.error").value(msg -> 
                    msg.toString().contains("Unsupported source"));
    }

    @Test
    void testSearch_Springer_MissingApiKey() {
        webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/search")
                        .queryParam("source", "springer")
                        .queryParam("q", "AI")
                        .queryParam("start", "0")
                        .queryParam("rows", "10")
                        .build())
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody()
                .jsonPath("$.error").value(msg -> 
                    msg.toString().contains("api_key"));
    }

    @Test
    void testSearch_Springer_EmptyQuery() {
        webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/search")
                        .queryParam("source", "springer")
                        .queryParam("q", "")
                        .queryParam("start", "0")
                        .queryParam("rows", "10")
                        .queryParam("api_key", "KEY")
                        .build())
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody()
                .jsonPath("$.error").value(msg -> 
                    msg.toString().contains("'q'"));
    }

    @Test
    void testSearch_InvalidStartParameter() {
        webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/search")
                        .queryParam("source", "springer")
                        .queryParam("q", "AI")
                        .queryParam("start", "-1")
                        .queryParam("rows", "10")
                        .queryParam("api_key", "KEY")
                        .build())
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody()
                .jsonPath("$.error").value(msg -> 
                    msg.toString().contains(">= 0"));
    }

    @Test
    void testSearch_InvalidRowsParameter() {
        webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/search")
                        .queryParam("source", "springer")
                        .queryParam("q", "AI")
                        .queryParam("start", "0")
                        .queryParam("rows", "0")
                        .queryParam("api_key", "KEY")
                        .build())
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody()
                .jsonPath("$.error").value(msg -> 
                    msg.toString().contains("> 0"));
    }

    @Test
    void testSearch_HAL_MissingWt() {
        webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/search")
                        .queryParam("source", "hal")
                        .queryParam("q", "ML")
                        .queryParam("start", "0")
                        .queryParam("rows", "10")
                        .build())
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody()
                .jsonPath("$.error").value(msg -> 
                    msg.toString().contains("wt"));
    }

    @Test
    void testSearch_ACM_MissingQuery() {
        webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/search")
                        .queryParam("source", "acm")
                        .queryParam("start", "0")
                        .queryParam("rows", "10")
                        .build())
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody()
                .jsonPath("$.error").value(msg -> 
                    msg.toString().contains("'q'"));
    }

    @Test
    void testSearch_NonNumericStart() {
        webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/search")
                        .queryParam("source", "springer")
                        .queryParam("q", "AI")
                        .queryParam("start", "abc")
                        .queryParam("rows", "10")
                        .queryParam("api_key", "KEY")
                        .build())
                .exchange()
                .expectStatus().isBadRequest()
                .expectBody()
                .jsonPath("$.error").value(msg -> 
                    msg.toString().contains("valid integer"));
    }
}
