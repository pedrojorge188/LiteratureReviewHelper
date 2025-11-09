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
        IResultFilter filter1 = new IResultFilter() {
                @Override
                public List<Article> filter(List<Article> articles) {
                        return List.copyOf(articles);
                }

                @Override
                public Map<Statistic, Integer> getExecutionStatistics() {
                        return Map.of();
                }
        };
        IResultFilter filter2 = new IResultFilter() {
                @Override
                public List<Article> filter(List<Article> articles) {
                        return List.copyOf(articles);
                }

                @Override
                public Map<Statistic, Integer> getExecutionStatistics() {
                        return Map.of();
                }
        };
        ResultFilterChain chain = new ResultFilterChain(Arrays.asList(filter1, filter2));
        List<Article> articles = Arrays.asList(
                new Article("", "", "", "", List.of(), "", Engines.ACM)
        );
        assertEquals(articles, chain.filter(articles));
    }

    @Test
    void testOneFilterFails_returnsListWithoutInfringingElement() {
        IResultFilter filter1 = new IResultFilter() {
                @Override
                public List<Article> filter(List<Article> articles) {
                        return List.copyOf(articles);
                }

                @Override
                public Map<Statistic, Integer> getExecutionStatistics() {
                        return Map.of();
                }
        };
        IResultFilter filter2 = new IResultFilter() {
                @Override
                public List<Article> filter(List<Article> articles) {
                        return articles
                                .stream()
                                .filter(article -> article.source() == Engines.ACM)
                                .toList();
                }

                @Override
                public Map<Statistic, Integer> getExecutionStatistics() {
                        return Map.of();
                }
        };

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
        Map<String, String> params = Map.of(
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

        // Arrange
        params = Map.of(
                "exclude_author", "Doe, John",
                "exclude_venue", "IEEE International Conference on Software Architecture",
                "exclude_title", "Continuous Integration Applied to Software-Intensive Embedded Systems"
        );
        chain = new ResultFilterChain.Builder().fromParams(params).build();

        articles = Arrays.asList(
                new Article("", "2010", "", "", List.of("Doe, John"), "", Engines.ACM),
                new Article("", "2015", "", "", List.of("Smith, Jane"), "", Engines.ACM),
                new Article("Continuous Integration Applied to Software-Intensive Embedded Systems", "2015", "", "", List.of("Doe, John"), "", Engines.ACM),
                new Article("", "2015", "IEEE International Conference on Software Architecture", "", List.of("Doe, John"), "", Engines.ACM),
                new Article("Continuous Integration Applied to Software-Intensive Embedded Systems", "2015", "IEEE International Conference on Software Architecture", "", List.of("Doe, John"), "", Engines.ACM)
        );

        // Act
        filtered = chain.filter(articles);

        // Assert
        assertEquals(
                List.of(new Article("", "2015", "", "", List.of("Smith, Jane"), "", Engines.ACM)),
                filtered
        );
    }

    @Test
    void testResultFilterChain_getExecutionStatistics() {
        // Arrange
        Map<String, String> params = Map.of(
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

        // Assert
        assertThrows(IllegalStateException.class, chain::getExecutionStatistics);

        // Act
        chain.filter(articles);

        // Assert
        assertEquals(
                Map.of(
                        IResultFilter.Statistic.INPUT, 5,
                        IResultFilter.Statistic.OUTPUT, 1,
                        IResultFilter.Statistic.DROPPED, 4
                ),
                chain.getExecutionStatistics()
        );
    }
}
