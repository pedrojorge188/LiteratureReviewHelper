package pt.isec.literaturereviewhelper.engines;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

import pt.isec.literaturereviewhelper.interfaces.IResultMapper;
import pt.isec.literaturereviewhelper.models.ArxivResponse;
import static pt.isec.literaturereviewhelper.commons.Params.*;

public class ArxivEngine extends EngineBase<ArxivResponse> {
private static final String BASE_URL = "https://export.arxiv.org";
    private static final String ENDPOINT = "/api/query";

    public ArxivEngine(WebClient webClient, IResultMapper<ArxivResponse> mapper) {
        super(webClient, mapper);
    }

    @Override
    protected MediaType getMediaType() {
        return MediaType.APPLICATION_ATOM_XML;
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
    protected Class<ArxivResponse> getResponseType() {
        return ArxivResponse.class;
    }

    @Override
    public String getEngineName() {
        return "Arxiv";
    }

    @Override
    protected List<String> getRequiredParameters() {
        return List.of(QUERY, START, ROWS);
    }

    @Override
    public Map<String, Object> mapParams(Map<String, String> raw) {
        Map<String, Object> p = new HashMap<>();

        p.put("search_query", "all:" + raw.get(QUERY));
        p.put("start", parseInteger(raw.get(START), START) * parseInteger(raw.get(ROWS), ROWS));
        p.put("max_results", parseInteger(raw.get(ROWS), ROWS));

        return p;
    }    
}
