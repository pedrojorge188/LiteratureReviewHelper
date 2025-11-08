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

        AuthorResultFilter filter = new AuthorResultFilter(List.of("Smith"));
        assertFalse(filter.filter(article));
    }

    @Test
    void testMatchesAuthorCaseInsensitive() {
        Article article = mock(Article.class);
        when(article.authors()).thenReturn(List.of("John Smith", "Alice Johnson"));

        AuthorResultFilter filterLower = new AuthorResultFilter(List.of("john smith"));
        assertTrue(filterLower.filter(article));

        AuthorResultFilter filterUpper = new AuthorResultFilter(List.of("JOHN SMITH"));
        assertTrue(filterUpper.filter(article));
    }

    @Test
    void testExclusionWhenMatchingAuthor() {
        Article article = mock(Article.class);
        when(article.authors()).thenReturn(List.of("John Smith", "Alice Johnson"));

        AuthorResultFilter filter = new AuthorResultFilter(List.of("John Smith"), true);
        assertFalse(filter.filter(article));
    }

    @Test
    void testNoMatch() {
        Article article = mock(Article.class);
        when(article.authors()).thenReturn(List.of("Alice", "Bob"));

        AuthorResultFilter filter = new AuthorResultFilter(List.of("Charlie"));
        assertFalse(filter.filter(article));

        filter = new AuthorResultFilter(List.of("Charlie"), true);
        assertTrue(filter.filter(article));
    }
}
