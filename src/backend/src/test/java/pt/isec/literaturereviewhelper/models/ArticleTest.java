package pt.isec.literaturereviewhelper.models;

import org.junit.jupiter.api.Test;
import java.util.Arrays;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class ArticleTest {

    @Test
    void testToString() {
        Article article = new Article(
            "Test Title",
            "2023",
            "Test Venue",
            "Journal",
            Arrays.asList("John Doe", "Jane Smith"),
            "http://example.com",
            Engines.HAL
        );

        String expected = "\nArticle\n{" +
                "\ttitle='Test Title',\n" +
                "\tpublicationYear='2023',\n" +
                "\tvenue='Test Venue',\n" +
                "\tvenueType='Journal',\n" +
                "\tauthors='John Doe, Jane Smith',\n" +
                "\tlink='http://example.com',\n" +
                "\tsource='HAL'\n" +
                "}\n";

        assertEquals(expected, article.toString());
    }

    @Test
    void testToStringWithEmptyAuthors() {
        Article article = new Article(
            "Test Title",
            "2023",
            "Test Venue",
            "Journal",
            List.of(),
            "http://example.com",
            Engines.HAL
        );

        String expected = "\nArticle\n{" +
                "\ttitle='Test Title',\n" +
                "\tpublicationYear='2023',\n" +
                "\tvenue='Test Venue',\n" +
                "\tvenueType='Journal',\n" +
                "\tauthors='',\n" +
                "\tlink='http://example.com',\n" +
                "\tsource='HAL'\n" +
                "}\n";

        assertEquals(expected, article.toString());
    }
}
