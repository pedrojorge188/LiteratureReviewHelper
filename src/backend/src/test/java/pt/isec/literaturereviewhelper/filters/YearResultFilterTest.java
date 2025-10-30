package pt.isec.literaturereviewhelper.filters;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import pt.isec.literaturereviewhelper.models.Article;

class YearResultFilterTest {

    private YearResultFilter filter;

    @BeforeEach
    void setUp() {
        filter = new YearResultFilter(2000, 2020);
    }

    @Test
    void testYearWithinRange_ReturnsTrue() {
        Article article = mock(Article.class);
        when(article.publicationYear()).thenReturn("2010");

        assertTrue(filter.filter(article));
    }

    @Test
    void testYearBeforeRange_ReturnsFalse() {
        Article article = mock(Article.class);
        when(article.publicationYear()).thenReturn("1999");

        assertFalse(filter.filter(article));
    }

    @Test
    void testYearAfterRange_ReturnsFalse() {
        Article article = mock(Article.class);
        when(article.publicationYear()).thenReturn("2021");

        assertFalse(filter.filter(article));
    }

    @Test
    void testNullYear_ReturnsFalse() {
        Article article = mock(Article.class);
        when(article.publicationYear()).thenReturn(null);
        when(article.title()).thenReturn("Test Article");

        assertFalse(filter.filter(article));
    }

    @Test
    void testYearAtMinBoundary_ReturnsTrue() {
        Article article = mock(Article.class);
        when(article.publicationYear()).thenReturn("2000");

        assertTrue(filter.filter(article));
    }

    @Test
    void testYearAtMaxBoundary_ReturnsTrue() {
        Article article = mock(Article.class);
        when(article.publicationYear()).thenReturn("2020");

        assertTrue(filter.filter(article));
    }
}
