package pt.isec.literaturereviewhelper.engines;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

import pt.isec.literaturereviewhelper.interfaces.IResultMapper;
import pt.isec.literaturereviewhelper.interfaces.ISearchEngine;
import pt.isec.literaturereviewhelper.models.Article;

import reactor.core.publisher.Mono;

/**
 * Abstract base class for search engine implementations.
 * Provides common functionality such as WebClient management and URL building.
 */
public abstract class EngineBase<R> implements ISearchEngine {
    protected final Logger log = LoggerFactory.getLogger(getClass());
    protected final WebClient webClient;
    private final IResultMapper<R> mapper;

    protected EngineBase(WebClient webClient, IResultMapper<R> mapper) {
        this.webClient = webClient;
        this.mapper = mapper;
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
     * Returns the class type for response deserialization.
     * @return Class type for the response body
     */
    protected abstract Class<R> getResponseType();

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
     * Returns the required parameters list of the respective engine.
     * @return List of required parameters
     */
    protected abstract List<String> getRequiredParameters();

    /**
     * Validates if the parameters are valid. Throws if there is any that isn't valid.
     * @param params Map of query parameters to validate
     */
    protected void validateParameters(Map<String, String> params) {
        for (String key : getRequiredParameters()) {
            String value = params.get(key);
            if (value == null || value.isBlank()) {
                throw new IllegalArgumentException(
                        "Missing or empty required parameter '" + key + "' for " + getEngineName()
                );
            }
        }
    }

    /**
     * Parses a string to integer with proper error handling
     */
    protected Integer parseInteger(String value, String paramName) {
        try {
            int parsed = Integer.parseInt(value);

            if ((paramName.contains("start") || paramName.contains("offset")) && parsed < 0) {
                throw new IllegalArgumentException("Parameter '" + paramName + "' must be >= 0");
            }

            if ((paramName.contains("rows") || paramName.contains("p")) && parsed < 1) {
                throw new IllegalArgumentException("Parameter '" + paramName + "' must be > 0");
            }

            return parsed;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Parameter '" + paramName + "' must be a valid integer");
        }
    }

    @Override
    public Map<String, Object> mapParams(Map<String, String> raw) {
        return new HashMap<>(raw);
    }

    /**
     * Default implementation of search that handles common HTTP logic.
     * Subclasses can override if they need custom behavior.
     */
    @Override
    public Mono<List<Article>> search(Map<String, String> params) {
        validateParameters(params);

        String fullURL = buildURL(mapParams(params));
        String engineName = getEngineName();
        
        return webClient.get()
                .uri(URI.create(fullURL))
                .accept(getMediaType())
                .retrieve()
                .bodyToMono(getResponseType())
                .doOnError(e -> log.error("❌ Error fetching from {}: {}", engineName, e.getMessage()))
                .doOnNext(resp -> log.info("✅ Response received from {}", engineName))
                .map(mapper::map);
    }
}
