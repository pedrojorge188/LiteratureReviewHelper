package pt.isec.literaturereviewhelper.engines;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static pt.isec.literaturereviewhelper.commons.Params.QUERY;
import static pt.isec.literaturereviewhelper.commons.Params.ROWS;
import static pt.isec.literaturereviewhelper.commons.Params.START;

import java.net.URI;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

import pt.isec.literaturereviewhelper.interfaces.IResultMapper;
import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.Engines;
import reactor.core.publisher.Mono;

class EngineBaseTest {
    protected WebClient webClient;
    @SuppressWarnings("rawtypes")
    protected WebClient.RequestHeadersUriSpec requestHeadersUriSpec;
    @SuppressWarnings("rawtypes")
    protected WebClient.RequestHeadersSpec requestHeadersSpec;
    private WebClient.ResponseSpec responseSpec;

    private IResultMapper<TestEngineResponse> resultMapper;
    private TestEngine testEngine;

    @BeforeEach
    void setUp() {
        webClient = mock(WebClient.class);
        requestHeadersUriSpec = mock(WebClient.RequestHeadersUriSpec.class);
        requestHeadersSpec = mock(WebClient.RequestHeadersSpec.class);
        responseSpec = mock(WebClient.ResponseSpec.class);

        resultMapper = mock(IResultMapper.class);

        when(webClient.get()).thenReturn(requestHeadersUriSpec);
        when(requestHeadersUriSpec.uri(any(URI.class))).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.accept(MediaType.APPLICATION_JSON)).thenReturn(requestHeadersSpec);
        when(requestHeadersSpec.retrieve()).thenReturn(responseSpec);

        testEngine = new TestEngine(webClient, resultMapper);
    }

    @Test
    void testRepeatedQueryDoesNotRecallUpstream() {
        // Arrange
        TestEngineResponse testResponse = new TestEngineResponse();
        when(responseSpec.bodyToMono(TestEngineResponse.class)).thenReturn(Mono.just(testResponse));

        List<Article> mapped = List.of(
                new Article("Old Data Science Paper", "2010", "Old Journal", "journal-article",
                        List.of("Jane Smith"), "https://example.com/old-ds-article", Engines.ACM),
                new Article("Future Data Science Paper", "2050", "Future Journal", "journal-article",
                        List.of("John Doe"), "https://example.com/future-ds-article", Engines.ACM),
                new Article("Valid Data Science Paper", "2018", "Valid Journal", "journal-article",
                        List.of("John Doe"), "https://example.com/valid-ds-article", Engines.ACM)
        );

        when(resultMapper.map(testResponse)).thenReturn(mapped);

        // Act
        Mono<List<Article>> firstCall = testEngine.search(Map.of(
                "q", "data science",
                "start", "0",
                "rows", "10",
                "deep_search_limit", "1" // only get 1st page of results
                // missing filter parameters
        ));
        Mono<List<Article>> secondCall = testEngine.search(Map.of(
                "q", "data science",
                "start", "0",
                "rows", "10",
                "deep_search_limit", "1", // only get 1st page of results
                "year_start", "2015",
                "year_end", "2020"
        ));

        // Assert
        verify(webClient, times(1)).get();
        assertEquals(firstCall.block(), List.of(
                new Article("Old Data Science Paper", "2010", "Old Journal", "journal-article",
                        List.of("Jane Smith"), "https://example.com/old-ds-article", Engines.ACM),
                new Article("Future Data Science Paper", "2050", "Future Journal", "journal-article",
                        List.of("John Doe"), "https://example.com/future-ds-article", Engines.ACM),
                new Article("Valid Data Science Paper", "2018", "Valid Journal", "journal-article",
                        List.of("John Doe"), "https://example.com/valid-ds-article", Engines.ACM)
        ));
        assertEquals(secondCall.block(), List.of(
                new Article("Valid Data Science Paper", "2018", "Valid Journal", "journal-article",
                        List.of("John Doe"), "https://example.com/valid-ds-article", Engines.ACM)
        ));
    }

    private class TestEngine extends EngineBase<TestEngineResponse> {
        private static final String BASE_URL = "https://example.com";
        private static final String ENDPOINT = "/api";

        public TestEngine(WebClient webClient, IResultMapper<TestEngineResponse> mapper) {
            super(webClient, mapper);
        }

        @Override
        public String getEngineName() {
            return "TestEngine";
        }
        @Override
        protected String getBaseUrl() {
            return BASE_URL;
        }
        @Override
        protected String getEndpoint() {
            return ENDPOINT;
        }
        @Override
        protected Class<TestEngineResponse> getResponseType() {
            return TestEngineResponse.class;
        }
        @Override
        protected List<String> getRequiredParameters() {
            return List.of(QUERY, START, ROWS);
        }
        @Override
        public Map<String, Object> mapParams(Map<String, String> raw) {
            return Map.of(
                    "query", raw.get(QUERY),
                    "start", raw.get(START),
                    "rows", raw.get(ROWS)
            );
        }
    }

    private class TestEngineResponse {
    }
}
