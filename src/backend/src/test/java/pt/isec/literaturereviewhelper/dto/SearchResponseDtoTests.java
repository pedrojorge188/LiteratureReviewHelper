package pt.isec.literaturereviewhelper.dto;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

import pt.isec.literaturereviewhelper.dtos.SearchResponseDto;
import pt.isec.literaturereviewhelper.interfaces.IResultFilter;
import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.Engines;

public class SearchResponseDtoTests {
    @Test
    public void testSearchResponseDtoFields() {
        String query = "test query";
        int totalArticles = 10;
        Map<Engines, Integer> articlesByEngine = Map.of(Engines.HAL, 5);
        Article article = org.mockito.Mockito.mock(Article.class);
        List<Article> articles = List.of(article);
        int duplicatedResultsRemoved = 2;
        Map<Engines, Map<String, Map<IResultFilter.Statistic, Integer>>> filterImpactByEngine = Map.of();
            
            
        SearchResponseDto dto = new SearchResponseDto(
            query,
            totalArticles,
            articlesByEngine,
            articles,
            duplicatedResultsRemoved,
            filterImpactByEngine
        );
            
            
        assertEquals(query, dto.getQuery());
        assertEquals(totalArticles, dto.getTotalArticles());
        assertEquals(articlesByEngine, dto.getArticlesByEngine());
        assertEquals(articles, dto.getArticles());
        assertEquals(duplicatedResultsRemoved, dto.getDuplicatedResultsRemoved());
        assertEquals(filterImpactByEngine, dto.getFilterImpactByEngine());
    }
}
