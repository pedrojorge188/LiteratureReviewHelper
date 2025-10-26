package pt.isec.literaturereviewhelper.SearchEngines;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import pt.isec.literaturereviewhelper.controllers.LiteratureSearchController;
import pt.isec.literaturereviewhelper.models.Engines;
import pt.isec.literaturereviewhelper.services.ApiService;
import reactor.core.publisher.Mono;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@WebFluxTest(controllers = LiteratureSearchController.class)
class LiteratureSearchControllerApiErrorTest {

    @Autowired
    private WebTestClient webClient;

    @MockitoBean
    private ApiService apiService;

    // ========================= GENERIC /search ENDPOINT =========================
    @Test
    void testSearchSpringerApiError() {
        when(apiService.search(eq(Engines.SPRINGER), anyMap()))
                .thenReturn(Mono.error(new WebClientResponseException(
                        500,
                        "Internal Server Error",
                        null,
                        "Something went wrong".getBytes(StandardCharsets.UTF_8),
                        StandardCharsets.UTF_8
                )));

        webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/search")
                        .queryParam("source", "springer")
                        .queryParam("q", "AI")
                        .queryParam("start", "0")
                        .queryParam("rows", "1")
                        .queryParam("api_key", "APIKEY")
                        .build())
                .exchange()
                .expectStatus().is5xxServerError()
                .expectBody()
                .jsonPath("$.status").value(status -> assertEquals("500", status.toString()))
                .jsonPath("$.error").isEqualTo("Internal Server Error")
                .jsonPath("$.body").isEqualTo("Something went wrong");
    }

    @Test
    void testSearchHALApiError() {
        when(apiService.search(eq(Engines.HAL), anyMap()))
                .thenReturn(Mono.error(new WebClientResponseException(
                        503, "Service Unavailable", null, null, StandardCharsets.UTF_8
                )));

        webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/search")
                        .queryParam("source", "hal")
                        .queryParam("q", "ML")
                        .queryParam("start", "0")
                        .queryParam("rows", "1")
                        .queryParam("wt", "bibtex")
                        .build())
                .exchange()
                .expectStatus().is5xxServerError()
                .expectBody()
                .jsonPath("$.error").isEqualTo("Service Unavailable")
                .jsonPath("$.status").isEqualTo("503");
    }

    @Test
    void testSearchACMApiError() {
        when(apiService.search(eq(Engines.ACM), anyMap()))
                .thenReturn(Mono.error(new WebClientResponseException(
                        502, "Bad Gateway", null, null, StandardCharsets.UTF_8
                )));

        webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/search")
                        .queryParam("source", "acm")
                        .queryParam("q", "DL")
                        .queryParam("start", "0")
                        .queryParam("rows", "1")
                        .build())
                .exchange()
                .expectStatus().is5xxServerError()
                .expectBody()
                .jsonPath("$.error").isEqualTo("Bad Gateway")
                .jsonPath("$.status").isEqualTo("502");
    }

    // ========================= DEPRECATED ENDPOINTS =========================
    @Test
    void testSearchSpringerApiError_Deprecated() {
        when(apiService.search(eq(Engines.SPRINGER), anyMap()))
                .thenReturn(Mono.error(new WebClientResponseException(
                        500,
                        "Internal Server Error",
                        null,
                        "Something went wrong".getBytes(StandardCharsets.UTF_8),
                        StandardCharsets.UTF_8
                )));

        webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/searchSpringer")
                        .queryParam("q", "AI")
                        .queryParam("s", 0)
                        .queryParam("p", 1)
                        .queryParam("api_key", "APIKEY")
                        .build())
                .exchange()
                .expectStatus().is5xxServerError()
                .expectBody()
                .jsonPath("$.status").value(status -> assertEquals("500", status.toString()))
                .jsonPath("$.error").isEqualTo("Internal Server Error")
                .jsonPath("$.body").isEqualTo("Something went wrong");
    }

    @Test
    void testSearchHalApiError_Deprecated() {
        when(apiService.search(eq(Engines.HAL), anyMap()))
                .thenReturn(Mono.error(new WebClientResponseException(
                        503, "Service Unavailable", null, null, StandardCharsets.UTF_8
                )));

        webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/searchHal")
                        .queryParam("q", "ML")
                        .queryParam("start", 0)
                        .queryParam("rows", 1)
                        .queryParam("wt", "json")
                        .build())
                .exchange()
                .expectStatus().is5xxServerError()
                .expectBody()
                .jsonPath("$.error").isEqualTo("Service Unavailable")
                .jsonPath("$.status").isEqualTo("503");
    }

    @Test
    void testSearchACMApiError_Deprecated() {
        when(apiService.search(eq(Engines.ACM), anyMap()))
                .thenReturn(Mono.error(new WebClientResponseException(
                        502, "Bad Gateway", null, null, StandardCharsets.UTF_8
                )));

        webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/searchACM")
                        .queryParam("querybibliographic", "DL")
                        .queryParam("filter", "filter1")
                        .queryParam("rows", 1)
                        .queryParam("offset", 0)
                        .build())
                .exchange()
                .expectStatus().is5xxServerError()
                .expectBody()
                .jsonPath("$.error").isEqualTo("Bad Gateway")
                .jsonPath("$.status").isEqualTo("502");
    }
}


