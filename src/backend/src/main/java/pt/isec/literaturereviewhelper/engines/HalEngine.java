package pt.isec.literaturereviewhelper.engines;

import java.util.*;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

import pt.isec.literaturereviewhelper.interfaces.IResultMapper;

import static pt.isec.literaturereviewhelper.commons.Params.*;

public class HalEngine extends EngineBase<String> {
    private static final String BASE_URL = "https://api.archives-ouvertes.fr";
    private static final String ENDPOINT = "/search/";

    public HalEngine(WebClient webClient, @Qualifier("halResultMapper") IResultMapper<String> mapper) {
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
    protected MediaType getMediaType() {
        return MediaType.TEXT_PLAIN;
    }

    @Override
    protected Class<String> getResponseType() {
        return String.class;
    }

    @Override
    public String getEngineName() {
        return "HAL";
    }

    @Override
    protected List<String> getRequiredParameters() {
        return List.of(QUERY, START, ROWS, WT);
    }

    @Override
    public Map<String, Object> mapParams(Map<String, String> raw) {
        Map<String, Object> p = new HashMap<>();

        p.put("q", raw.get(QUERY));
        p.put("start", parseInteger(raw.get(START), START));
        p.put("rows", parseInteger(raw.get(ROWS), ROWS));
        p.put("wt", raw.get(WT));

        return p;
    }
}