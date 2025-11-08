package pt.isec.literaturereviewhelper.filters;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import org.junit.jupiter.api.Test;
import pt.isec.literaturereviewhelper.models.Article;
import java.util.List;

class AuthorResultFilterTest {

    @Test
    void testNullAuthors_ReturnsFalse() {
        Article article = mock(Article.class);
        when(article.authors()).thenReturn(null);

        AuthorResultFilter filter = new AuthorResultFilter("Smith");
        assertFalse(filter.filter(article));
    }

    @Test
    void testMatchesAuthorCaseInsensitive() {
        Article article = mock(Article.class);
        when(article.authors()).thenReturn(List.of("John Smith", "Alice Johnson"));

        AuthorResultFilter filterLower = new AuthorResultFilter("john smith");
        assertTrue(filterLower.filter(article));

        AuthorResultFilter filterUpper = new AuthorResultFilter("JOHN SMITH");
        assertTrue(filterUpper.filter(article));
    }


    @Test
    void testNoMatch_ReturnsFalse() {
        Article article = mock(Article.class);
        when(article.authors()).thenReturn(List.of("Alice", "Bob"));

        AuthorResultFilter filter = new AuthorResultFilter("Charlie");
        assertFalse(filter.filter(article));
    }

    @Test
    void testReversedFilter() {
        AuthorResultFilter filter = new AuthorResultFilter("john smith", true);
        Article article = mock(Article.class);
        when(article.authors()).thenReturn(List.of("John Smith", "Alice Johnson"));

        assertFalse(filter.filter(article));
    }
}
