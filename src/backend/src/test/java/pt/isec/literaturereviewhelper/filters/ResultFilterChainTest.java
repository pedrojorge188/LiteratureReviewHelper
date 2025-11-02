package pt.isec.literaturereviewhelper.filters;

import org.junit.jupiter.api.Test;
import pt.isec.literaturereviewhelper.interfaces.IResultFilter;
import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.Engines;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

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
}
