package pt.isec.literaturereviewhelper.models;

import jakarta.xml.bind.annotation.*;
import java.util.List;

@XmlRootElement(name = "feed", namespace = "http://www.w3.org/2005/Atom")
@XmlAccessorType(XmlAccessType.FIELD)
public class ArxivResponse {

    @XmlElement(name = "entry", namespace = "http://www.w3.org/2005/Atom")
    private List<Entry> entries;

    public List<Entry> getEntries() { return entries; }
    public void setEntries(List<Entry> entries) { this.entries = entries; }

    // ---------------- ENTRY ----------------
    @XmlAccessorType(XmlAccessType.FIELD)
    public static class Entry {

        @XmlElement(name = "id", namespace = "http://www.w3.org/2005/Atom")
        private String id;

        @XmlElement(name = "title", namespace = "http://www.w3.org/2005/Atom")
        private String title;

        @XmlElement(name = "published", namespace = "http://www.w3.org/2005/Atom")
        private String published;

        @XmlElement(name = "author", namespace = "http://www.w3.org/2005/Atom")
        private List<Author> authors;

        // Getters & setters
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getPublished() { return published; }
        public void setPublished(String published) { this.published = published; }

        public List<Author> getAuthors() { return authors; }
        public void setAuthors(List<Author> authors) { this.authors = authors; }
    }

    // ---------------- AUTHOR ----------------
    @XmlAccessorType(XmlAccessType.FIELD)
    public static class Author {

        @XmlElement(name = "name", namespace = "http://www.w3.org/2005/Atom")
        private String name;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }
}
