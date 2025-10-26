package pt.isec.literaturereviewhelper.engines;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

import pt.isec.literaturereviewhelper.interfaces.ISearchEngine;
import pt.isec.literaturereviewhelper.models.Article;
import reactor.core.publisher.Mono;

/**
 * Abstract base class for search engine implementations.
 * Provides common functionality such as WebClient management and URL building.
 */
public abstract class EngineBase implements ISearchEngine {

    protected final Logger log = LoggerFactory.getLogger(getClass());
    protected final WebClient webClient;

    protected EngineBase(WebClient webClient) {
        this.webClient = webClient;
    }

    /**
     * Returns the base URL for the search engine API.
     * @return the base URL string
     */
    protected abstract String getBaseUrl();

    /**
     * Returns the API endpoint path.
     * @return the endpoint path string
     */
    protected abstract String getEndpoint();

    /**
     * Returns the media type for API requests.
     * @return the MediaType (defaults to APPLICATION_JSON)
     */
    protected MediaType getMediaType() {
        return MediaType.APPLICATION_JSON;
    }

    /**
     * Extracts articles from the raw response data.
     * @param responseBody the raw response from the API
     * @return List of extracted articles
     */
    protected abstract <T> List<Article> extractInformation(T responseBody);

    /**
     * Returns the class type for response deserialization.
     * @return Class type for the response body
     */
    protected abstract Class<?> getResponseType();

    /**
     * Builds a complete URL with query parameters for the API request.
     * 
     * @param params Map of query parameters to include in the URL
     * @return The complete URL string with encoded parameters
     */
    protected String buildURL(Map<String, Object> params) {
        StringBuilder rawQuery = new StringBuilder();
        params.forEach((k, v) -> {
            if (!rawQuery.isEmpty()) rawQuery.append("&");
            rawQuery.append(k).append("=").append(URLEncoder.encode(v.toString(), StandardCharsets.UTF_8));
        });

        String fullURL = getBaseUrl() + getEndpoint();
        if (!rawQuery.isEmpty()) {
            fullURL += "?" + rawQuery;
        }
        
        return fullURL;
    }

    /**
     * Default implementation of search that handles common HTTP logic.
     * Subclasses can override if they need custom behavior.
     */
    @Override
    public Mono<List<Article>> search(Map<String, Object> params) {
        String fullURL = buildURL(params);
        String engineName = getEngineName();
        
        return webClient.get()
                .uri(URI.create(fullURL))
                .accept(getMediaType())
                .retrieve()
                .bodyToMono(getResponseType())
                .doOnError(e -> log.error("❌ Error fetching from {}: {}", engineName, e.getMessage()))
                .doOnNext(resp -> log.info("✅ Response received from {}", engineName))
                .map(this::extractInformation);
    }
    
}
