package pt.isec.literaturereviewhelper.mappers;

import org.junit.jupiter.api.Test;
import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.Engines;
import pt.isec.literaturereviewhelper.models.SpringerResponse;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class SpringerMapperTest {
    private final SpringerMapper mapper = new SpringerMapper();

    private static SpringerResponse makeResponse(SpringerResponse.Record... records) {
        SpringerResponse r = new SpringerResponse();
        r.setRecords(List.of(records));
        return r;
    }

    private static SpringerResponse.Record rec(
            String title, String publicationDate, String publicationName,
            String contentType, List<String> creators, String url
    ) {
        SpringerResponse.Record rec = new SpringerResponse.Record();
        rec.setTitle(title);
        rec.setPublicationDate(publicationDate);
        rec.setPublicationName(publicationName);
        rec.setContentType(contentType);

        if (creators != null) {
            rec.setCreators(
                    creators.stream().map(s -> {
                        SpringerResponse.Creator c = new SpringerResponse.Creator();
                        c.setName(s);
                        return c;
                    }).toList()
            );
        }

        if (url != null) {
            SpringerResponse.Url u = new SpringerResponse.Url();
            u.setValue(url);
            rec.setUrl(List.of(u));
        }

        return rec;
    }

    @Test
    void testMapsFullRecord() {
        SpringerResponse response = makeResponse(
                rec(
                        "AI Research Paper",
                        "2024-01-15",
                        "Journal of AI",
                        "Article",
                        List.of("John Doe", "Jane Smith"),
                        "https://example.com/article"
                )
        );

        List<Article> out = mapper.map(response);
        assertEquals(1, out.size());

        Article a = out.get(0);
        assertEquals("AI Research Paper", a.title());
        assertEquals("2024", a.publicationYear()); // year extracted from yyyy-MM-dd
        assertEquals("Journal of AI", a.venue());
        assertEquals("Article", a.venueType());
        assertEquals("John Doe, Jane Smith", a.authors());
        assertEquals("https://example.com/article", a.link());
        assertEquals(Engines.SPRINGER, a.source());
    }

    @Test
    void testReturnsEmptyListWhenResponseOrRecordsNull() {
        assertTrue(mapper.map(null).isEmpty());

        SpringerResponse r = new SpringerResponse();
        r.setRecords(null);
        assertTrue(mapper.map(r).isEmpty());
    }

    @Test
    void testHandlesPartialRecordGracefully() {
        SpringerResponse response = makeResponse(
                rec(
                        "Incomplete Article",
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

        assertEquals("Incomplete Article", a.title());
        assertEquals("", a.publicationYear());
        assertEquals("", a.venue());
        assertEquals("", a.venueType());
        assertEquals("", a.authors());
        assertEquals("", a.link());
        assertEquals(Engines.SPRINGER, a.source());
    }

    @Test
    void testNormalizesTitleNewlines() {
        SpringerResponse response = makeResponse(
                rec("Title with\nnewlines\nand  spaces", null, null, null, null, null)
        );

        List<Article> out = mapper.map(response);
        assertEquals(1, out.size());
        assertEquals("Title with newlines and  spaces".replaceAll("\\s{2,}", "  "),
                out.get(0).title());
    }

    @Test
    void testMapsMultipleRecords() {
        SpringerResponse response = makeResponse(
                rec("Article 1", "2023-01-01", null, null, null, null),
                rec("Article 2", "2023-02-01", null, null, null, null),
                rec("Article 3", "2023-03-01", null, null, null, null)
        );

        List<Article> out = mapper.map(response);
        assertEquals(3, out.size());
        assertEquals("Article 1", out.get(0).title());
        assertEquals("Article 2", out.get(1).title());
        assertEquals("Article 3", out.get(2).title());
    }

    @Test
    void testAuthorsWithNullAndEmptyAreSkipped_WhenBuildingAuthors() {
        SpringerResponse.Record rec = new SpringerResponse.Record();
        rec.setTitle("T");
        var c1 = new SpringerResponse.Creator();
        c1.setName(null);
        SpringerResponse.Creator c2 = null;
        var c3 = new SpringerResponse.Creator();
        c3.setName("   ");
        var c4 = new SpringerResponse.Creator();
        c4.setName("Alice Doe");

        rec.setCreators(java.util.Arrays.asList(c1, c2, c3, c4));

        SpringerResponse wrapper = new SpringerResponse();
        wrapper.setRecords(List.of(rec));

        List<Article> out = mapper.map(wrapper);
        assertEquals(1, out.size());
        assertEquals("Alice Doe", out.get(0).authors());
    }
}
