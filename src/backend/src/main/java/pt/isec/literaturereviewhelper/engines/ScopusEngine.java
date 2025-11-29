package pt.isec.literaturereviewhelper.engines;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.reactive.function.client.WebClient;

import pt.isec.literaturereviewhelper.interfaces.IResultMapper;
import pt.isec.literaturereviewhelper.models.ScopusResponse;
import static pt.isec.literaturereviewhelper.commons.Params.*;

public class ScopusEngine extends EngineBase<ScopusResponse>{
    private static final String BASE_URL = "https://api.elsevier.com";
    private static final String ENDPOINT = "/content/search/scopus";

    public ScopusEngine(WebClient webClient, IResultMapper<ScopusResponse> mapper) {
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
    protected Class<ScopusResponse> getResponseType() {
        return ScopusResponse.class;
    }

    @Override
    public String getEngineName() {
        return "Scopus";
    }

    @Override
    protected List<String> getRequiredParameters() {
        return List.of(QUERY, START, ROWS, API_KEY);
    }

    @Override
    public Map<String, Object> mapParams(Map<String, String> raw) {
        Map<String, Object> p = new HashMap<>();

        p.put("query", raw.get(QUERY));
        p.put("start", parseInteger(raw.get(START), START) * parseInteger(raw.get(ROWS), ROWS));
        p.put("count", parseInteger(raw.get(ROWS), ROWS));
        p.put("apiKey", raw.get(API_KEY));

        return p;
    }
}
