package pt.isec.literaturereviewhelper.models;

import java.util.List;

public class SpringerResponse {
    private List<Record> records;

    public List<Record> getRecords() {
        return records;
    }

    public void setRecords(List<Record> records) {
        this.records = records;
    }

    public static class Record {
        private String title;
        private String publicationDate;
        private String publicationName;
        private String contentType;
        private List<Creator> creators;
        private List<Url> url;

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getPublicationDate() { return publicationDate; }
        public void setPublicationDate(String publicationDate) { this.publicationDate = publicationDate; }

        public String getPublicationName() { return publicationName; }
        public void setPublicationName(String publicationName) { this.publicationName = publicationName; }

        public String getContentType() { return contentType; }
        public void setContentType(String contentType) { this.contentType = contentType; }

        public List<Creator> getCreators() { return creators; }
        public void setCreators(List<Creator> creators) { this.creators = creators; }

        public List<Url> getUrl() { return url; }
        public void setUrl(List<Url> url) { this.url = url; }
    }

    public static class Creator {
        private String name;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
    }

    public static class Url {
        private String value;

        public String getValue() { return value; }
        public void setValue(String value) { this.value = value; }
    }
}
