package pt.isec.literaturereviewhelper.engines;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import pt.isec.literaturereviewhelper.interfaces.IResultMapper;
import pt.isec.literaturereviewhelper.models.ACMResponse;

@Component
public class ACMEngine extends EngineBase<ACMResponse> {
    private static final String BASE_URL = "https://api.crossref.org";
    private static final String ENDPOINT = "/works";

    public ACMEngine(WebClient webClient, IResultMapper<ACMResponse> mapper) {
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
    protected Class<ACMResponse> getResponseType() {
        return ACMResponse.class;
    }

    @Override
    public String getEngineName() {
        return "ACM";
    }

    @Override
    protected List<String> getRequiredParameters() {
        return List.of("q", "start", "rows");
    }

    @Override
    public Map<String, Object> mapParams(Map<String, String> raw) {
        Map<String, Object> p = new HashMap<>();

        p.put("query.bibliographic", raw.get("q"));
        p.put("offset", parseInteger(raw.get("start"), "start"));
        p.put("rows",   parseInteger(raw.get("rows"), "rows"));
        p.put("filter", raw.getOrDefault("filter", "prefix:10.1145"));

        return p;
    }
}