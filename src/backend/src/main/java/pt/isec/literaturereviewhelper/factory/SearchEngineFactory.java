
package pt.isec.literaturereviewhelper.factory;

import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import pt.isec.literaturereviewhelper.engines.ACMEngine;
import pt.isec.literaturereviewhelper.engines.HalEngine;
import pt.isec.literaturereviewhelper.engines.SpringerEngine;
import pt.isec.literaturereviewhelper.interfaces.ISearchEngine;
import pt.isec.literaturereviewhelper.models.Engines;

@Component
public class SearchEngineFactory {

    private final WebClient webClient;

    public SearchEngineFactory(WebClient webClient) {
        this.webClient = webClient;
    }

    public ISearchEngine createSearchEngine(Engines type) {
        return switch (type) {
            case ACM -> new ACMEngine(webClient);
            case HAL -> new HalEngine(webClient);
            case SPRINGER -> new SpringerEngine(webClient);
        };
    }
}