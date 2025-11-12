package pt.isec.literaturereviewhelper.filters;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.Engines;
import pt.isec.literaturereviewhelper.interfaces.IResultFilter;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class DuplicateResultFilterTest {

    private DuplicateResultFilter filter;

    @BeforeEach
    void setUp() {
        filter = new DuplicateResultFilter();
    }

    @Test
    void testFilter_UniqueArticles() {
        Article article1 = new Article("Unique Title 1", "Author 1", "http://url1", "Venue 1", List.of(), "", Engines.ACM);
        Article article2 = new Article("Unique Title 2", "Author 2", "http://url2", "Venue 2", List.of(), "", Engines.HAL);

        assertTrue(filter.filter(article1));
        assertTrue(filter.filter(article2));
    }

    @Test
    void testFilter_DuplicateArticles_SameTitle() {
        Article article1 = new Article("Duplicate Title", "Author 1", "http://url1", "Venue 1", List.of(), "", Engines.ACM);
        Article article2 = new Article("Duplicate Title", "Author 2", "http://url2", "Venue 2", List.of(), "", Engines.HAL);

        assertTrue(filter.filter(article1)); // First occurrence should be kept
        assertFalse(filter.filter(article2)); // Second occurrence should be dropped
    }

    @Test
    void testFilter_DuplicateArticles_ProcessedTitles() {
        Article article1 = new Article("Title with Punctuation!", "Author 1", "http://url1", "Venue 1", List.of(), "", Engines.ACM);
        Article article2 = new Article("title with punctuation", "Author 2", "http://url2", "Venue 2", List.of(), "", Engines.HAL);

        assertTrue(filter.filter(article1)); // First occurrence should be kept
        assertFalse(filter.filter(article2)); // Second occurrence should be dropped
    }

    @Test
    void testFilter_WithListOfArticles() {
        List<Article> articles = new ArrayList<>();
        articles.add(new Article("Title A", "Author A", "http://urlA", "Venue A", List.of(), "", Engines.ACM));
        articles.add(new Article("Title B", "Author B", "http://urlB", "Venue B", List.of(), "", Engines.HAL));
        articles.add(new Article("Title A", "Author C", "http://urlC", "Venue C", List.of(), "", Engines.SPRINGER)); // Duplicate of Title A
        articles.add(new Article("Title C!", "Author D", "http://urlD", "Venue D", List.of(), "", Engines.ACM));
        articles.add(new Article("title c", "Author E", "http://urlE", "Venue E", List.of(), "", Engines.HAL)); // Duplicate of Title C!

        List<Article> filteredArticles = filter.filter(articles);

        assertEquals(5, filter.getExecutionStatistics().get(IResultFilter.Statistic.INPUT));
        assertEquals(3, filter.getExecutionStatistics().get(IResultFilter.Statistic.OUTPUT));
        assertEquals(2, filter.getExecutionStatistics().get(IResultFilter.Statistic.DROPPED));

        assertEquals(3, filteredArticles.size());
        assertTrue(filteredArticles.stream().anyMatch(a -> a.title().equals("Title A")));
        assertTrue(filteredArticles.stream().anyMatch(a -> a.title().equals("Title B")));
        assertTrue(filteredArticles.stream().anyMatch(a -> a.title().equals("Title C!")));
    }
}