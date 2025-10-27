package pt.isec.literaturereviewhelper.factories;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import pt.isec.literaturereviewhelper.engines.ACMEngine;
import pt.isec.literaturereviewhelper.engines.HalEngine;
import pt.isec.literaturereviewhelper.engines.SpringerEngine;
import pt.isec.literaturereviewhelper.interfaces.IResultMapper;
import pt.isec.literaturereviewhelper.interfaces.ISearchEngine;
import pt.isec.literaturereviewhelper.interfaces.ISearchEngineFactory;
import pt.isec.literaturereviewhelper.models.ACMResponse;
import pt.isec.literaturereviewhelper.models.Engines;
import pt.isec.literaturereviewhelper.models.SpringerResponse;

@Component
public class SearchEngineFactory implements ISearchEngineFactory {
    private final WebClient webClient;
    private final IResultMapper<ACMResponse> acmMapper;
    private final IResultMapper<String> halMapper;
    private final IResultMapper<SpringerResponse> springerMapper;

    public SearchEngineFactory(WebClient webClient, IResultMapper<ACMResponse> acmMapper,
                               @Qualifier("halResultMapper") IResultMapper<String> halMapper, IResultMapper<SpringerResponse> springer) {
        this.webClient = webClient;
        this.acmMapper = acmMapper;
        this.halMapper = halMapper;
        this.springerMapper = springer;
    }

    public ISearchEngine createSearchEngine(Engines type) {
        return switch (type) {
            case ACM -> new ACMEngine(webClient, acmMapper);
            case HAL -> new HalEngine(webClient, halMapper);
            case SPRINGER -> new SpringerEngine(webClient, springerMapper);
        };
    }
}