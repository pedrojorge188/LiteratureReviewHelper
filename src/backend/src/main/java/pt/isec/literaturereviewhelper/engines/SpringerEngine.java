package pt.isec.literaturereviewhelper.engines;

import java.util.*;

import org.springframework.web.reactive.function.client.WebClient;

import pt.isec.literaturereviewhelper.interfaces.IResultMapper;
import pt.isec.literaturereviewhelper.models.SpringerResponse;

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
        return List.of("q", "start", "rows", "api_key");
    }

    @Override
    public Map<String, Object> mapParams(Map<String, String> raw) {
        Map<String, Object> p = new HashMap<>();

        p.put("q", raw.get("q"));
        p.put("s", parseInteger(raw.get("start"), "start"));
        p.put("p", parseInteger(raw.get("rows"), "rows"));
        p.put("api_key", raw.get("api_key"));

        return p;
    }
}