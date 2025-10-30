package pt.isec.literaturereviewhelper.mappers;

import org.junit.jupiter.api.Test;
import pt.isec.literaturereviewhelper.models.ACMResponse;
import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.Engines;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class ACMMapperTest {
    private final ACMMapper mapper = new ACMMapper();

    private ACMResponse makeResponse(ACMResponse.Item... items) {
        ACMResponse.Message msg = new ACMResponse.Message();
        msg.setItems(List.of(items));
        ACMResponse resp = new ACMResponse();
        resp.setMessage(msg);
        return resp;
    }

    @Test
    void testMapsFullArticleCorrectly() {
        ACMResponse.Item item = getItem();

        ACMResponse response = makeResponse(item);

        List<Article> articles = mapper.map(response);

        assertEquals(1, articles.size());
        Article a = articles.get(0);
        assertEquals("AI Research Paper", a.title());
        assertEquals("2024", a.publicationYear());
        assertEquals("Journal of AI", a.venue());
        assertEquals("journal-article", a.venueType());
        assertEquals(List.of("John Doe", "Jane Smith"), a.authors());
        assertEquals("https://example.com/article", a.link());
        assertEquals(Engines.ACM, a.source());
    }

    @Test
    void testHandlesMissingGivenNameGracefully() {
        ACMResponse.Item item = new ACMResponse.Item();
        item.setTitle(List.of("Article"));
        item.setAuthors(List.of(
                new ACMResponse.Author(null, "Doe"),
                new ACMResponse.Author("Jane", "Smith")
        ));

        ACMResponse response = makeResponse(item);
        List<Article> articles = mapper.map(response);

        assertEquals(1, articles.size());
        assertEquals(List.of("Doe", "Jane Smith"), articles.get(0).authors());
    }

    @Test
    void testExtractsYearFromPublishedOnlineIfNoPrint() {
        ACMResponse.Item item = new ACMResponse.Item();
        item.setTitle(List.of("Online Article"));
        item.setPublishedOnline(new ACMResponse.PublishedDate(List.of(List.of(2023, 5))));

        ACMResponse response = makeResponse(item);
        List<Article> articles = mapper.map(response);

        assertEquals(1, articles.size());
        assertEquals("2023", articles.get(0).publicationYear());
    }

    @Test
    void testReturnsEmptyListIfNoMessage() {
        ACMResponse response = new ACMResponse();
        response.setMessage(null);

        List<Article> result = mapper.map(response);
        assertTrue(result.isEmpty());
    }

    @Test
    void testReturnsEmptyListIfNoItems() {
        ACMResponse.Message msg = new ACMResponse.Message();
        msg.setItems(null);
        ACMResponse response = new ACMResponse();
        response.setMessage(msg);

        List<Article> result = mapper.map(response);
        assertTrue(result.isEmpty());
    }

    @Test
    void testCleansNewlinesInTitle() {
        ACMResponse.Item item = new ACMResponse.Item();
        item.setTitle(List.of("Title with\nnewlines\nand spaces"));
        ACMResponse response = makeResponse(item);

        List<Article> articles = mapper.map(response);

        assertEquals(1, articles.size());
        assertEquals("Title with newlines and spaces", articles.get(0).title());
    }

    @Test
    void testHandlesEmptyLinkListGracefully() {
        ACMResponse.Item item = new ACMResponse.Item();
        item.setTitle(List.of("Article"));
        item.setLink(List.of()); // empty

        ACMResponse response = makeResponse(item);
        List<Article> articles = mapper.map(response);

        assertEquals(1, articles.size());
        assertEquals("", articles.get(0).link());
    }

    @Test
    void testMapsMultipleArticles() {
        ACMResponse.Item a1 = new ACMResponse.Item();
        a1.setTitle(List.of("Article 1"));
        ACMResponse.Item a2 = new ACMResponse.Item();
        a2.setTitle(List.of("Article 2"));
        ACMResponse.Item a3 = new ACMResponse.Item();
        a3.setTitle(List.of("Article 3"));

        ACMResponse response = makeResponse(a1, a2, a3);

        List<Article> articles = mapper.map(response);

        assertEquals(3, articles.size());
        assertEquals("Article 1", articles.get(0).title());
        assertEquals("Article 2", articles.get(1).title());
        assertEquals("Article 3", articles.get(2).title());
    }

    @Test
    void testHandlesMinimalData() {
        ACMResponse.Item item = new ACMResponse.Item();
        item.setTitle(List.of("Minimal Article"));
        ACMResponse response = makeResponse(item);

        List<Article> articles = mapper.map(response);

        assertEquals(1, articles.size());
        Article a = articles.get(0);
        assertEquals("Minimal Article", a.title());
        assertEquals("", a.publicationYear());
        assertEquals("", a.venue());
        assertEquals("", a.venueType());
        assertEquals(List.of(), a.authors());
        assertEquals("", a.link());
    }

    @Test
    void testLinkListFirstMissingUrl_YieldsEmptyString() throws Exception {
        // Build ACMResponse with an item whose first link has no "URL"
        ACMResponse.Item item = new ACMResponse.Item();
        item.setTitle(List.of("Paper"));

        List<Map<String, String>> links = new java.util.ArrayList<>();
        links.add(Map.of("content-type", "text/html"));             // no URL key
        links.add(Map.of("URL", "https://should-not-be-picked"));   // second has URL

        setPrivate(item, links);

        ACMResponse.Message msg = new ACMResponse.Message();
        msg.setItems(List.of(item));
        ACMResponse resp = new ACMResponse();
        resp.setMessage(msg);

        List<Article> out = mapper.map(resp);
        assertEquals(1, out.size());
        assertEquals("", out.get(0).link(), "Should pick empty when first link lacks URL");
    }

    private static ACMResponse.Item getItem() {
        ACMResponse.Item item = new ACMResponse.Item();
        item.setTitle(List.of("AI Research Paper"));
        item.setType("journal-article");
        item.setContainerTitle(List.of("Journal of AI"));
        item.setAuthors(List.of(
                new ACMResponse.Author("John", "Doe"),
                new ACMResponse.Author("Jane", "Smith")
        ));
        item.setPublishedPrint(new ACMResponse.PublishedDate(List.of(List.of(2024, 1, 15))));
        item.setLink(List.of(Map.of("URL", "https://example.com/article")));
        return item;
    }

    private static void setPrivate(Object target, Object value) throws Exception {
        var f = target.getClass().getDeclaredField("link");
        f.setAccessible(true);
        f.set(target, value);
    }
}
