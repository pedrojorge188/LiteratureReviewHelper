package pt.isec.literaturereviewhelper.models;

import jakarta.xml.bind.annotation.*;
import java.util.List;

@XmlRootElement(name = "feed", namespace = "http://www.w3.org/2005/Atom")
@XmlAccessorType(XmlAccessType.FIELD)
public class ArxivResponse {

    // ------------------------ FEED LEVEL ------------------------
    @XmlElement(name = "id", namespace = "http://www.w3.org/2005/Atom")
    private String id;

    @XmlElement(name = "title", namespace = "http://www.w3.org/2005/Atom")
    private String title;

    @XmlElement(name = "updated", namespace = "http://www.w3.org/2005/Atom")
    private String updated;

    @XmlElement(name = "link", namespace = "http://www.w3.org/2005/Atom")
    private List<Link> links;

    @XmlElement(name = "totalResults", namespace = "http://a9.com/-/spec/opensearch/1.1/")
    private Integer totalResults;

    @XmlElement(name = "startIndex", namespace = "http://a9.com/-/spec/opensearch/1.1/")
    private Integer startIndex;

    @XmlElement(name = "itemsPerPage", namespace = "http://a9.com/-/spec/opensearch/1.1/")
    private Integer itemsPerPage;

    @XmlElement(name = "entry", namespace = "http://www.w3.org/2005/Atom")
    private List<Entry> entries;

    public ArxivResponse() {}

    // ------------------------ GETTERS / SETTERS ------------------------
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getUpdated() { return updated; }
    public void setUpdated(String updated) { this.updated = updated; }

    public List<Link> getLinks() { return links; }
    public void setLinks(List<Link> links) { this.links = links; }

    public Integer getTotalResults() { return totalResults; }
    public void setTotalResults(Integer totalResults) { this.totalResults = totalResults; }

    public Integer getStartIndex() { return startIndex; }
    public void setStartIndex(Integer startIndex) { this.startIndex = startIndex; }

    public Integer getItemsPerPage() { return itemsPerPage; }
    public void setItemsPerPage(Integer itemsPerPage) { this.itemsPerPage = itemsPerPage; }

    public List<Entry> getEntries() { return entries; }
    public void setEntries(List<Entry> entries) { this.entries = entries; }

    // ------------------------ NESTED CLASSES ------------------------
    @XmlAccessorType(XmlAccessType.FIELD)
    public static class Link {
        @XmlAttribute(name = "href")
        private String href;

        @XmlAttribute(name = "rel")
        private String rel;

        @XmlAttribute(name = "type")
        private String type;

        @XmlAttribute(name = "title")
        private String title;

        public Link() {}

        public String getHref() { return href; }
        public void setHref(String href) { this.href = href; }

        public String getRel() { return rel; }
        public void setRel(String rel) { this.rel = rel; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
    }

    @XmlAccessorType(XmlAccessType.FIELD)
    public static class Entry {
        @XmlElement(name = "id", namespace = "http://www.w3.org/2005/Atom")
        private String id;

        @XmlElement(name = "title", namespace = "http://www.w3.org/2005/Atom")
        private String title;

        @XmlElement(name = "summary", namespace = "http://www.w3.org/2005/Atom")
        private String summary;

        @XmlElement(name = "published", namespace = "http://www.w3.org/2005/Atom")
        private String published;

        @XmlElement(name = "updated", namespace = "http://www.w3.org/2005/Atom")
        private String updated;

        @XmlElement(name = "link", namespace = "http://www.w3.org/2005/Atom")
        private List<Link> links;

        @XmlElement(name = "author", namespace = "http://www.w3.org/2005/Atom")
        private List<Author> authors;

        @XmlElement(name = "comment", namespace = "http://arxiv.org/schemas/atom")
        private String comment;

        @XmlElement(name = "category", namespace = "http://www.w3.org/2005/Atom")
        private List<Category> categories;

        @XmlElement(name = "primary_category", namespace = "http://arxiv.org/schemas/atom")
        private PrimaryCategory primaryCategory;

        public Entry() {}

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getSummary() { return summary; }
        public void setSummary(String summary) { this.summary = summary; }

        public String getPublished() { return published; }
        public void setPublished(String published) { this.published = published; }

        public String getUpdated() { return updated; }
        public void setUpdated(String updated) { this.updated = updated; }

        public List<Link> getLinks() { return links; }
        public void setLinks(List<Link> links) { this.links = links; }

        public List<Author> getAuthors() { return authors; }
        public void setAuthors(List<Author> authors) { this.authors = authors; }

        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }

        public List<Category> getCategories() { return categories; }
        public void setCategories(List<Category> categories) { this.categories = categories; }

        public PrimaryCategory getPrimaryCategory() { return primaryCategory; }
        public void setPrimaryCategory(PrimaryCategory primaryCategory) { this.primaryCategory = primaryCategory; }
    }

    @XmlAccessorType(XmlAccessType.FIELD)
    public static class Author {
        @XmlElement(name = "name", namespace = "http://www.w3.org/2005/Atom")
        private String name;

        public Author() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    @XmlAccessorType(XmlAccessType.FIELD)
    public static class Category {
        @XmlAttribute(name = "term")
        private String term;

        @XmlAttribute(name = "scheme")
        private String scheme;

        public Category() {}

        public String getTerm() { return term; }
        public void setTerm(String term) { this.term = term; }

        public String getScheme() { return scheme; }
        public void setScheme(String scheme) { this.scheme = scheme; }
    }

    @XmlAccessorType(XmlAccessType.FIELD)
    public static class PrimaryCategory {
        @XmlAttribute(name = "term")
        private String term;

        public PrimaryCategory() {}

        public String getTerm() { return term; }
        public void setTerm(String term) { this.term = term; }
    }
}
