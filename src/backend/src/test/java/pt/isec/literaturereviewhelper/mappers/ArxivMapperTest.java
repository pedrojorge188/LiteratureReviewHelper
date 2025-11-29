package pt.isec.literaturereviewhelper.mappers;

import org.junit.jupiter.api.Test;
import pt.isec.literaturereviewhelper.models.ArxivResponse;
import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.Engines;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ArxivMapperTest {

    private final ArxivMapper mapper = new ArxivMapper();

    private static ArxivResponse makeResponse(ArxivResponse.Entry... entries) {
        ArxivResponse response = new ArxivResponse();
        response.setEntries(List.of(entries));
        return response;
    }

    private static ArxivResponse.Entry entry(
            String id,
            String title,
            String published,
            ArxivResponse.Author... authors
    ) {
        ArxivResponse.Entry e = new ArxivResponse.Entry();
        e.setId(id);
        e.setTitle(title);
        e.setPublished(published);
        if (authors != null) {
            e.setAuthors(List.of(authors));
        }
        return e;
    }

    private static ArxivResponse.Author author(String name) {
        ArxivResponse.Author a = new ArxivResponse.Author();
        a.setName(name);
        return a;
    }

    @Test
    void testMapsFullEntry() {
        ArxivResponse response = makeResponse(
                entry(
                        "https://arxiv.org/abs/1234.5678",
                        "AI Research Paper",
                        "2024-01-15T12:00:00Z",
                        author("John Doe"), author("Jane Smith")
                )
        );

        List<Article> out = mapper.map(response);
        assertEquals(1, out.size());

        Article a = out.get(0);
        assertEquals("AI Research Paper", a.title());
        assertEquals("2024", a.publicationYear());
        assertEquals("arXiv", a.venue());
        assertEquals("Preprint", a.venueType());
        assertEquals(List.of("John Doe, Jane Smith"), a.authors());
        assertEquals("https://arxiv.org/abs/1234.5678", a.link());
        assertEquals(Engines.ARXIV, a.source());
    }

    @Test
    void testReturnsEmptyListWhenResponseOrEntriesNull() {
        assertTrue(mapper.map(null).isEmpty());

        ArxivResponse r1 = new ArxivResponse();
        assertTrue(mapper.map(r1).isEmpty());
    }

    @Test
    void testHandlesPartialEntryGracefully() {
        ArxivResponse response = makeResponse(
                entry(
                        "https://arxiv.org/abs/0000.0000",
                        null,
                        null
                )
        );

        List<Article> out = mapper.map(response);
        assertEquals(1, out.size());
        Article a = out.get(0);

        assertEquals("", a.title());
        assertEquals("", a.publicationYear());
        assertEquals("arXiv", a.venue());
        assertEquals("Preprint", a.venueType());
        assertEquals(1, a.authors().size());
        assertEquals("https://arxiv.org/abs/0000.0000", a.link());
        assertEquals(Engines.ARXIV, a.source());
    }

    @Test
    void testAuthorsWithNullOrBlankAreSkippedAndConcatenated() {
        ArxivResponse.Author a1 = author(null);
        ArxivResponse.Author a2 = author("  ");
        ArxivResponse.Author a3 = author("Alice Doe");
        ArxivResponse.Author a4 = author("Bob Smith");

        ArxivResponse response = makeResponse(
                entry(
                        "https://arxiv.org/abs/9999.9999",
                        "Title",
                        "2023-05-01",
                        a1, a2, a3, a4
                )
        );

        List<Article> out = mapper.map(response);
        assertEquals(1, out.size());
        assertEquals(List.of("Alice Doe, Bob Smith"), out.get(0).authors());
    }

    @Test
    void testNormalizesTitleTrim() {
        ArxivResponse response = makeResponse(
                entry(
                        "https://arxiv.org/abs/1111.1111",
                        "   Title with spaces   ",
                        "2023-01-01"
                )
        );

        List<Article> out = mapper.map(response);
        assertEquals(1, out.size());
        assertEquals("Title with spaces", out.get(0).title());
    }

    @Test
    void testMapsMultipleEntries() {
        ArxivResponse response = makeResponse(
                entry("https://arxiv.org/abs/1", "Paper 1", "2023-01-01"),
                entry("https://arxiv.org/abs/2", "Paper 2", "2023-02-01"),
                entry("https://arxiv.org/abs/3", "Paper 3", "2023-03-01")
        );

        List<Article> out = mapper.map(response);
        assertEquals(3, out.size());
        assertEquals("Paper 1", out.get(0).title());
        assertEquals("Paper 2", out.get(1).title());
        assertEquals("Paper 3", out.get(2).title());
    }
}
