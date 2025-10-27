package pt.isec.literaturereviewhelper.mappers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import pt.isec.literaturereviewhelper.models.Article;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class HalMapperTest {
    private HalMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new HalMapper();
    }

    @Test
    void testReturnsEmptyListOnNullOrBlankInput() {
        assertTrue(mapper.map(null).isEmpty());
        assertTrue(mapper.map("").isEmpty());
        assertTrue(mapper.map("   ").isEmpty());
    }

    @Test
    void testParsesBasicArticle() {
        String bibtex = """
                @article{test2024,
                  TITLE = {Machine Learning in Healthcare},
                  AUTHOR = {Doe, John and Smith, Jane},
                  YEAR = {2024},
                  JOURNAL = {Medical Informatics Journal},
                  URL = {https://hal.science/hal-12345}
                }
                """;

        List<Article> result = mapper.map(bibtex);

        assertEquals(1, result.size());
        Article a = result.get(0);
        assertEquals("Machine Learning in Healthcare", a.title());
        assertEquals("Doe, John, Smith, Jane", a.authors());
        assertEquals("2024", a.publicationYear());
        assertEquals("Medical Informatics Journal", a.venue());
        assertEquals("Journal Article", a.venueType());
        assertEquals("https://hal.science/hal-12345", a.link());
    }

    @Test
    void testParsesConferencePaper() {
        String bibtex = """
                @inproceedings{conf2024,
                  TITLE = {Conference Paper Title},
                  AUTHOR = {Author, Test},
                  YEAR = {2024},
                  BOOKTITLE = {International Conference on AI}
                }
                """;

        List<Article> result = mapper.map(bibtex);

        assertEquals(1, result.size());
        Article a = result.get(0);
        assertEquals("Conference Paper Title", a.title());
        assertEquals("International Conference on AI", a.venue());
        assertEquals("Conference Proceedings", a.venueType());
    }

    @Test
    void testParsesPhDThesis() {
        String bibtex = """
                @phdthesis{phd2023,
                  TITLE = {PhD Thesis on Quantum Computing},
                  AUTHOR = {Student, Phd},
                  YEAR = {2023},
                  SCHOOL = {MIT}
                }
                """;

        List<Article> result = mapper.map(bibtex);
        Article a = result.get(0);
        assertEquals("PhD Thesis on Quantum Computing", a.title());
        assertEquals("MIT", a.venue());
        assertEquals("PhD Thesis", a.venueType());
    }

    @Test
    void testParsesBook() {
        String bibtex = """
                @book{book2024,
                  TITLE = {Advanced Machine Learning},
                  AUTHOR = {Expert, Book},
                  YEAR = {2024},
                  PUBLISHER = {Springer}
                }
                """;

        List<Article> result = mapper.map(bibtex);
        Article a = result.get(0);
        assertEquals("Advanced Machine Learning", a.title());
        assertEquals("Springer", a.venue());
        assertEquals("Book", a.venueType());
    }

    @Test
    void testHandlesMultipleEntries() {
        String bibtex = """
                @article{art1, TITLE = {First Article}, YEAR = {2023}}
                @article{art2, TITLE = {Second Article}, YEAR = {2024}}
                @inproceedings{conf, TITLE = {Conference Paper}, YEAR = {2025}}
                """;

        List<Article> result = mapper.map(bibtex);
        assertEquals(3, result.size());
    }

    @Test
    void testCleansBracesInTitle() {
        String bibtex = """
                @article{test,
                  TITLE = {{Title} with {Braces}},
                  YEAR = {2024}
                }
                """;

        List<Article> result = mapper.map(bibtex);
        assertEquals("Title with Braces", result.get(0).title());
    }

    @Test
    void testHandlesMissingFieldsGracefully() {
        String bibtex = """
                @article{minimal,
                  TITLE = {Minimal Article}
                }
                """;

        List<Article> result = mapper.map(bibtex);
        Article a = result.get(0);
        assertEquals("Minimal Article", a.title());
        assertEquals("", a.publicationYear());
        assertEquals("", a.venue());
        assertEquals("", a.authors());
        assertEquals("", a.link());
    }

    @Test
    void testMixedEntries_CoverVenueFallbackAndTypeLabelMapping() {
        String bibtex = """
            @article{art1,
              TITLE = {Article Title},
              AUTHOR = {Alpha, A},
              YEAR = {2024},
              JOURNAL = {JournalName},
              URL = {https://j.example}
            }
            @inproceedings{proc1,
              TITLE = {Proceedings Title},
              AUTHOR = {Beta, B},
              YEAR = {2023},
              BOOKTITLE = {ConfName},
              URL = {https://c.example}
            }
            @phdthesis{phd1,
              TITLE = {Thesis Title},
              AUTHOR = {Gamma, G},
              YEAR = {2022},
              SCHOOL = {Famous University},
              URL = {https://t.example}
            }
            @book{book1,
              TITLE = {Book Title},
              AUTHOR = {Delta, D},
              YEAR = {2021},
              PUBLISHER = {Big Publisher},
              URL = {https://b.example}
            }
            """;

        List<Article> out = mapper.map(bibtex);
        assertEquals(4, out.size());

        // 1) article -> venue from JOURNAL; type label "Journal Article"
        Article a0 = out.get(0);
        assertEquals("Article Title", a0.title());
        assertEquals("JournalName", a0.venue());
        assertEquals("Journal Article", a0.venueType());
        assertEquals("https://j.example", a0.link());

        // 2) inproceedings -> venue from BOOKTITLE; type label "Conference Proceedings"
        Article a1 = out.get(1);
        assertEquals("Proceedings Title", a1.title());
        assertEquals("ConfName", a1.venue());
        assertEquals("Conference Proceedings", a1.venueType());
        assertEquals("https://c.example", a1.link());

        // 3) phdthesis -> venue from SCHOOL; type label "PhD Thesis"
        Article a2 = out.get(2);
        assertEquals("Thesis Title", a2.title());
        assertEquals("Famous University", a2.venue());
        assertEquals("PhD Thesis", a2.venueType());

        // 4) book -> venue from PUBLISHER; type label "Book"
        Article a3 = out.get(3);
        assertEquals("Book Title", a3.title());
        assertEquals("Big Publisher", a3.venue());
        assertEquals("Book", a3.venueType());
    }
}
