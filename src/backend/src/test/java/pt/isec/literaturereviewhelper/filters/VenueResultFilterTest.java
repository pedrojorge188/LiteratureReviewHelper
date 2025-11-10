package pt.isec.literaturereviewhelper.filters;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;

import pt.isec.literaturereviewhelper.models.Article;

class VenueResultFilterTest {
    private VenueResultFilter filter;

    @Test
    void testNullVenue_ReturnsFalse() {
        Article article = mock(Article.class);
        when(article.venue()).thenReturn(null);

        filter = new VenueResultFilter(List.of("IEEE International Conference on Software Architecture"));
        assertFalse(filter.filter(article));

        filter = new VenueResultFilter(List.of("IEEE International Conference on Software Architecture"), false);
        assertFalse(filter.filter(article));
    }

    @Test
    void testMatchesVenueCaseInsensitive() {
        Article article = mock(Article.class);
        when(article.venue()).thenReturn("2017 IEEE International Conference on Software Architecture");

        filter = new VenueResultFilter(List.of("ieee international conference on software architecture"));
        assertTrue(filter.filter(article));

        filter = new VenueResultFilter(List.of("IEEE INTERNATIONAL CONFERENCE ON SOFTWARE ARCHITECTURE"));
        assertTrue(filter.filter(article));
    }

    @Test
    void testExclusionWhenMatchingVenue() {
        Article article = mock(Article.class);
        when(article.venue()).thenReturn("2017 IEEE International Conference on Software Architecture");

        filter = new VenueResultFilter(List.of("IEEE International Conference on Software Architecture"), true);
        assertFalse(filter.filter(article));
    }

    @Test
    void testNoMatch() {
        Article article = mock(Article.class);
        when(article.venue()).thenReturn("IEEE/ACM International Conference on Software and System Processes");

        filter = new VenueResultFilter(List.of("IEEE International Conference on Software Architecture"));
        assertFalse(filter.filter(article));

        filter = new VenueResultFilter(List.of("IEEE International Conference on Software Architecture"), true);
        assertTrue(filter.filter(article));
    }
}
