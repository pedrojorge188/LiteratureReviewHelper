package pt.isec.literaturereviewhelper.mappers;

import org.junit.jupiter.api.Test;
import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.Engines;
import pt.isec.literaturereviewhelper.models.ScopusResponse;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ScopusMapperTest {

    private final ScopusMapper mapper = new ScopusMapper();

    private static ScopusResponse makeResponse(ScopusResponse.Entry... entries) {
        ScopusResponse response = new ScopusResponse();
        ScopusResponse.SearchResults sr = new ScopusResponse.SearchResults();
        sr.setEntries(List.of(entries));
        response.setSearchResults(sr);
        return response;
    }

    private static ScopusResponse.Entry entry(
            String title,
            String coverDate,
            String publicationName,
            String subtypeDescription,
            String aggregationType,
            String authors,
            ScopusResponse.ScopusLink... links
    ) {
        ScopusResponse.Entry e = new ScopusResponse.Entry();
        e.setTitle(title);
        e.setCoverDate(coverDate);
        e.setPublicationName(publicationName);
        e.setSubtypeDescription(subtypeDescription);
        e.setAggregationType(aggregationType);
        e.setAuthors(authors);
        if (links != null) {
            e.setLinks(List.of(links));
        }
        return e;
    }

    private static ScopusResponse.ScopusLink link(String ref, String href) {
        ScopusResponse.ScopusLink l = new ScopusResponse.ScopusLink();
        l.setRef(ref);
        l.setHref(href);
        return l;
    }

    @Test
    void testMapsFullEntry() {
        ScopusResponse response = makeResponse(
                entry(
                        "AI Research Paper",
                        "2024-01-15",
                        "Journal of AI",
                        "Article",
                        null,
                        "John Doe; Jane Smith",
                        link("scopus", "https://example.com/article")
                )
        );

        List<Article> out = mapper.map(response);
        assertEquals(1, out.size());

        Article a = out.get(0);
        assertEquals("AI Research Paper", a.title());
        assertEquals("2024", a.publicationYear());
        assertEquals("Journal of AI", a.venue());
        assertEquals("Article", a.venueType());
        assertEquals(List.of("John Doe", "Jane Smith"), a.authors());
        assertEquals("https://example.com/article", a.link());
        assertEquals(Engines.SCOPUS, a.source());
    }

    @Test
    void testReturnsEmptyListWhenResponseOrEntriesNull() {
        assertTrue(mapper.map(null).isEmpty());

        ScopusResponse r1 = new ScopusResponse();
        assertTrue(mapper.map(r1).isEmpty());

        ScopusResponse r2 = new ScopusResponse();
        r2.setSearchResults(new ScopusResponse.SearchResults());
        assertTrue(mapper.map(r2).isEmpty());
    }

    @Test
    void testHandlesPartialEntryGracefully() {
        ScopusResponse response = makeResponse(
                entry(
                        "Incomplete Paper",
                        null,
                        null,
                        null,
                        null,
                        null
                )
        );

        List<Article> out = mapper.map(response);
        assertEquals(1, out.size());
        Article a = out.get(0);

        assertEquals("Incomplete Paper", a.title());
        assertEquals("", a.publicationYear());
        assertEquals("", a.venue());
        assertEquals("", a.venueType());
        assertEquals(List.of(), a.authors());
        assertEquals("", a.link());
        assertEquals(Engines.SCOPUS, a.source());
    }

    @Test
    void testAuthorsSplitAndTrimmedCorrectly() {
        ScopusResponse response = makeResponse(
                entry(
                        "Multi-author Paper",
                        null,
                        null,
                        null,
                        null,
                        "Alice Doe, Bob Smith ; Charlie Lee"
                )
        );

        List<Article> out = mapper.map(response);
        assertEquals(1, out.size());
        assertEquals(List.of("Alice Doe", "Bob Smith", "Charlie Lee"), out.get(0).authors());
    }

    @Test
    void testUsesAggregationTypeIfSubtypeDescriptionMissing() {
        ScopusResponse response = makeResponse(
                entry(
                        "Paper",
                        null,
                        null,
                        null,
                        "Conference Paper",
                        null
                )
        );

        List<Article> out = mapper.map(response);
        assertEquals(1, out.size());
        assertEquals("Conference Paper", out.get(0).venueType());
    }

    @Test
    void testSelectsCorrectLink() {
        ScopusResponse response = makeResponse(
                entry(
                        "Paper",
                        null,
                        null,
                        null,
                        null,
                        null,
                        link("other", "https://other.com"),
                        link("SCOPUS", "https://scopus.com")
                )
        );

        List<Article> out = mapper.map(response);
        assertEquals(1, out.size());
        assertEquals("https://scopus.com", out.get(0).link());
    }

    @Test
    void testMapsMultipleEntries() {
        ScopusResponse response = makeResponse(
                entry("Paper 1", "2023-01-01", null, null, null, null),
                entry("Paper 2", "2023-02-01", null, null, null, null),
                entry("Paper 3", "2023-03-01", null, null, null, null)
        );

        List<Article> out = mapper.map(response);
        assertEquals(3, out.size());
        assertEquals("Paper 1", out.get(0).title());
        assertEquals("Paper 2", out.get(1).title());
        assertEquals("Paper 3", out.get(2).title());
    }
}
