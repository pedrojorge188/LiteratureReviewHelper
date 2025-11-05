package pt.isec.literaturereviewhelper.controllers;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import pt.isec.literaturereviewhelper.commons.*;
import pt.isec.literaturereviewhelper.dtos.SearchResponseDto;
import pt.isec.literaturereviewhelper.interfaces.ILiteratureReviewService;
import reactor.core.publisher.Mono;
import java.util.Map;

@RestController
@RequestMapping("api")
public class LiteratureSearchController {
    private final ILiteratureReviewService literatureReviewService;

    public LiteratureSearchController(ILiteratureReviewService literatureReviewService) {
        this.literatureReviewService = literatureReviewService;
    }

    /**
     * Universal search endpoint that routes to different academic search engines.
     * Accepts dynamic parameters based on the source type.
     */

     // Header Example: "X-API-KEYS: google=key1,reddit=key2,medium=key3"
    @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<SearchResponseDto> search(
        @RequestParam Map<String, String> allParams, 
        @RequestHeader(value = RequestHeaderUtils.X_API_KEYS, required = false) String apiKeysHeader) {
            

        var apiKeysByEngine = RequestHeaderUtils.parseApiKeysHeader(apiKeysHeader);

        return literatureReviewService.performLiteratureSearch(allParams, apiKeysByEngine);
    }
}
