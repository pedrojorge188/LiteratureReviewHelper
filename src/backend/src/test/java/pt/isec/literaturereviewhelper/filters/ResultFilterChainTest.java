package pt.isec.literaturereviewhelper.filters;

import org.junit.jupiter.api.Test;
import pt.isec.literaturereviewhelper.interfaces.IResultFilter;
import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.Engines;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class ResultFilterChainTest {

    @Test
    void testConstructor_nullList_throwsNullPointerException() {
        assertThrows(NullPointerException.class, () -> new ResultFilterChain(null));
    }

    @Test
    void testEmptyFilterList_returnsUnmodifiedList() {
        ResultFilterChain chain = new ResultFilterChain(Collections.emptyList());
        List<Article> articles = Arrays.asList(
                new Article("", "", "", "", List.of(), "", Engines.ACM)
        );
        assertEquals(articles, chain.filter(articles));
    }

    @Test
    void testAllFiltersPass_returnsUnmodifiedList() {
        IResultFilter filter1 = articles -> List.copyOf(articles);
        IResultFilter filter2 = articles -> List.copyOf(articles);
        ResultFilterChain chain = new ResultFilterChain(Arrays.asList(filter1, filter2));
        List<Article> articles = Arrays.asList(
                new Article("", "", "", "", List.of(), "", Engines.ACM)
        );
        assertEquals(articles, chain.filter(articles));
    }

    @Test
    void testOneFilterFails_returnsListWithoutInfringingElement() {
        IResultFilter filter1 = articles -> List.copyOf(articles);
        IResultFilter filter2 = articles -> articles
                .stream()
                .filter(article -> article.source() == Engines.ACM)
                .toList();
        ResultFilterChain chain = new ResultFilterChain(Arrays.asList(filter1, filter2));
        List<Article> articles = Arrays.asList(
                new Article("", "", "", "", List.of(), "", Engines.ACM),
                new Article("", "", "", "", List.of(), "", Engines.HAL)
        );
        assertEquals(List.of(new Article("", "", "", "", List.of(), "", Engines.ACM)), chain.filter(articles));
    }

    @Test
    void testBuilder_fromParams_createsCorrectFilterChain() {
        // Arrange
        var params = Map.of(
                "year_start", "2015",
                "year_end", "2020",
                "author", "Doe, John",
                "venue", "IEEE International Conference on Software Architecture",
                "title", "Continuous Integration Applied to Software-Intensive Embedded Systems"
        );
        ResultFilterChain chain = new ResultFilterChain.Builder().fromParams(params).build();

        List<Article> articles = Arrays.asList(
                new Article("", "2010", "", "", List.of("Doe, John"), "", Engines.ACM),
                new Article("", "2015", "", "", List.of("Smith, Jane"), "", Engines.ACM),
                new Article("Continuous Integration Applied to Software-Intensive Embedded Systems", "2015", "", "", List.of("Doe, John"), "", Engines.ACM),
                new Article("", "2015", "IEEE International Conference on Software Architecture", "", List.of("Doe, John"), "", Engines.ACM),
                new Article("Continuous Integration Applied to Software-Intensive Embedded Systems", "2015", "IEEE International Conference on Software Architecture", "", List.of("Doe, John"), "", Engines.ACM)
        );

        // Act
        List<Article> filtered = chain.filter(articles);

        // Assert
        assertEquals(
                List.of(new Article("Continuous Integration Applied to Software-Intensive Embedded Systems", "2015", "IEEE International Conference on Software Architecture", "", List.of("Doe, John"), "", Engines.ACM)),
                filtered
        );
    }
}
