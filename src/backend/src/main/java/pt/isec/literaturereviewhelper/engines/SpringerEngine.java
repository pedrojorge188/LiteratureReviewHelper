package pt.isec.literaturereviewhelper.engines;

import java.util.*;

import org.springframework.web.reactive.function.client.WebClient;

import pt.isec.literaturereviewhelper.interfaces.IResultMapper;
import pt.isec.literaturereviewhelper.models.SpringerResponse;

import static pt.isec.literaturereviewhelper.commons.Params.*;

public class SpringerEngine extends EngineBase<SpringerResponse> {
    private static final String BASE_URL = "https://api.springernature.com";
    private static final String ENDPOINT = "/meta/v2/json";

    public SpringerEngine(WebClient webClient, IResultMapper<SpringerResponse> mapper) {
        super(webClient, mapper);
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
    protected Class<SpringerResponse> getResponseType() {
        return SpringerResponse.class;
    }

    @Override
    public String getEngineName() {
        return "Springer";
    }

    @Override
    protected List<String> getRequiredParameters() {
        return List.of(QUERY, START, ROWS, API_KEY);
    }

    @Override
    public Map<String, Object> mapParams(Map<String, String> raw) {
        Map<String, Object> p = new HashMap<>();

        p.put("q", raw.get(QUERY));
        p.put("s", parseInteger(raw.get(START), START));
        p.put("p", parseInteger(raw.get(ROWS), ROWS));
        p.put("api_key", raw.get(API_KEY));

        return p;
    }
}