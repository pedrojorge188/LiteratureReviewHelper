package pt.isec.literaturereviewhelper.engines;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.reactive.function.client.WebClient;

import pt.isec.literaturereviewhelper.interfaces.ISearchEngine;

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
}
