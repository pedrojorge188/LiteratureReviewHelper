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

        String expected =
                """

                Article
                {\ttitle='Test Title',
                \tpublicationYear='2023',
                \tvenue='Test Venue',
                \tvenueType='Journal',
                \tauthors='John Doe, Jane Smith',
                \tlink='http://example.com',
                \tsource='HAL'
                }
                """;

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

        String expected =
                """

                Article
                {\ttitle='Test Title',
                \tpublicationYear='2023',
                \tvenue='Test Venue',
                \tvenueType='Journal',
                \tauthors='',
                \tlink='http://example.com',
                \tsource='HAL'
                }
                """;

        assertEquals(expected, article.toString());
    }
}
