package pt.isec.literaturereviewhelper.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import pt.isec.literaturereviewhelper.factories.SearchEngineFactory;
import pt.isec.literaturereviewhelper.interfaces.ISearchEngine;
import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.Engines;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class ApiServiceTest {
    private SearchEngineFactory factory;
    private ISearchEngine engineMock;
    private ApiService apiService;

    @BeforeEach
    void setUp() {
        factory = mock(SearchEngineFactory.class);
        engineMock = mock(ISearchEngine.class);
        apiService = new ApiService(factory);
    }

    @Test
    void testDelegateToSpringerEngineAndReturnsResults() {
        Map<String, String> params = Map.of("q", "AI", "p", "10", "s", "0", "api_key", "KEY");
        Article expected = new Article(
                "Test Article", "2023", "Springer Journal",
                "Article", List.of("John Doe"), "http://example.com", Engines.SPRINGER
        );

        when(factory.createSearchEngine(Engines.SPRINGER)).thenReturn(engineMock);
        when(engineMock.search(params)).thenReturn(Mono.just(List.of(expected)));

        StepVerifier.create(apiService.search(Engines.SPRINGER, params))
                .assertNext(list -> {
                    assertEquals(1, list.size());
                    assertEquals("Test Article", list.get(0).title());
                })
                .verifyComplete();

        verify(factory).createSearchEngine(Engines.SPRINGER);
        verify(engineMock).search(params);
    }

    @Test
    void testDelegatesToHalEngineAndReturnsResults() {
        Map<String, String> params = Map.of("q", "ML", "start", "0", "rows", "10", "wt", "bibtex");
        Article expected = new Article(
                "HAL Paper", "2022", "HAL Conference",
                "Conference", List.of("Jane Doe"), "http://hal.link", Engines.HAL
        );

        when(factory.createSearchEngine(Engines.HAL)).thenReturn(engineMock);
        when(engineMock.search(params)).thenReturn(Mono.just(List.of(expected)));

        StepVerifier.create(apiService.search(Engines.HAL, params))
                .assertNext(list -> {
                    assertEquals(1, list.size());
                    assertEquals("HAL Paper", list.get(0).title());
                })
                .verifyComplete();

        verify(factory).createSearchEngine(Engines.HAL);
        verify(engineMock).search(params);
    }

    @Test
    void testDelegatesToAcmEngineAndReturnsResults() {
        Map<String, String> params = Map.of(
                "query.bibliographic", "Deep Learning",
                "offset", "0",
                "rows", "10"
        );
        Article expected = new Article(
                "ACM Paper", "2021", "ACM Journal",
                "Journal", List.of("Alice Smith"), "http://acm.link", Engines.ACM
        );

        when(factory.createSearchEngine(Engines.ACM)).thenReturn(engineMock);
        when(engineMock.search(params)).thenReturn(Mono.just(List.of(expected)));

        StepVerifier.create(apiService.search(Engines.ACM, params))
                .assertNext(list -> {
                    assertEquals(1, list.size());
                    assertEquals("ACM Paper", list.get(0).title());
                })
                .verifyComplete();

        verify(factory).createSearchEngine(Engines.ACM);
        verify(engineMock).search(params);
    }

    @Test
    void testDelegatesCorrectlyAndPassesParams() {
        Map<String, String> params = Map.of("any", "value");

        when(factory.createSearchEngine(any())).thenReturn(engineMock);
        when(engineMock.search(anyMap())).thenReturn(Mono.just(List.of()));

        StepVerifier.create(apiService.search(Engines.SPRINGER, params))
                .expectNext(List.of())
                .verifyComplete();

        verify(factory, times(1)).createSearchEngine(Engines.SPRINGER);
        verify(engineMock, times(1)).search(params);
    }

    @Test
    void testPropagatesEngineErrors() {
        Map<String, String> params = Map.of("q", "oops");
        when(factory.createSearchEngine(Engines.ACM)).thenReturn(engineMock);
        when(engineMock.search(params)).thenReturn(Mono.error(new RuntimeException("Engine down")));

        StepVerifier.create(apiService.search(Engines.ACM, params))
                .expectErrorMatches(ex -> ex instanceof RuntimeException &&
                        ex.getMessage().equals("Engine down"))
                .verify();

        verify(factory).createSearchEngine(Engines.ACM);
        verify(engineMock).search(params);
    }
}
