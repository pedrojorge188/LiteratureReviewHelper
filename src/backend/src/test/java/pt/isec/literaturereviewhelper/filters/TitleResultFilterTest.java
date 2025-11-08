package pt.isec.literaturereviewhelper.filters;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;

import pt.isec.literaturereviewhelper.models.Article;

public class TitleResultFilterTest {
    private TitleResultFilter filter;

    @Test
    void testMatchesTitleCaseInsensitive() {
        Article article = mock(Article.class);
        when(article.title()).thenReturn("Continuous Integration Applied to Software-Intensive Embedded Systems");

        filter = new TitleResultFilter("continuous integration applied to software-intensive embedded systems");
        assertTrue(filter.filter(article));

        filter = new TitleResultFilter("CONTINUOUS INTEGRATION APPLIED TO SOFTWARE-INTENSIVE EMBEDDED SYSTEMS");
        assertTrue(filter.filter(article));
    }

    @Test
    void testNoMatch() {
        Article article = mock(Article.class);
        when(article.title()).thenReturn("Continuous Integration Applied to Software-Intensive Embedded Systems");

        filter = new TitleResultFilter("continuous integration applied to software-intensive embedded systems");
        assertTrue(filter.filter(article));

        filter = new TitleResultFilter("continuous integration applied to software-intensive embedded systems", true);
        assertFalse(filter.filter(article));
    }
}
