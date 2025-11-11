package pt.isec.literaturereviewhelper.filters;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import pt.isec.literaturereviewhelper.models.Article;

class YearResultFilterTest {

    private YearResultFilter filter;

    @BeforeEach
    void setUp() {
        filter = new YearResultFilter(2000, 2020);
    }

    @ParameterizedTest
    @ValueSource(strings = {"2000", "2010", "2020"})
    void testYearWithinRange_ReturnsTrue(String year) {
        Article article = mock(Article.class);
        when(article.publicationYear()).thenReturn("2010");

        assertTrue(filter.filter(article));
    }

    @ParameterizedTest
    @ValueSource(strings = {"1999", "2021"})
    void testYearOutOfRange_ReturnsFalse() {
        Article article = mock(Article.class);
        when(article.publicationYear()).thenReturn("1999");

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
    void testReversedFilter() {
        filter = new YearResultFilter(2000, 2020, true);
        Article article = mock(Article.class);

        when(article.publicationYear()).thenReturn("1995");
        assertTrue(filter.filter(article));

        when(article.publicationYear()).thenReturn("2000");
        assertFalse(filter.filter(article));

        when(article.publicationYear()).thenReturn("2010");
        assertFalse(filter.filter(article));
    }
}
