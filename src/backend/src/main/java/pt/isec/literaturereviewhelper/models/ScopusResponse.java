package pt.isec.literaturereviewhelper.models;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class ScopusResponse {

    @JsonProperty("search-results")
    private SearchResults searchResults;

    public SearchResults getSearchResults() { return searchResults; }

    public void setSearchResults(SearchResults searchResults) { this.searchResults = searchResults; }

    public static class SearchResults {

        @JsonProperty("entry")
        private List<Entry> entries;

        public List<Entry> getEntries() { return entries; }

        public void setEntries(List<Entry> entries) { this.entries = entries; }
    }

    public static class Entry {

        @JsonProperty("dc:title")
        private String title;

        @JsonProperty("prism:coverDate")
        private String coverDate;

        @JsonProperty("prism:publicationName")
        private String publicationName;

        @JsonProperty("prism:aggregationType")
        private String aggregationType;

        @JsonProperty("subtypeDescription")
        private String subtypeDescription;

        @JsonProperty("dc:creator")
        private String authors;

        @JsonProperty("link")
        private List<ScopusLink> links;

        public String getTitle() { return title; }

        public void setTitle(String title) { this.title = title; }

        public String getCoverDate() { return coverDate; }

        public void setCoverDate(String coverDate) { this.coverDate = coverDate; }

        public String getPublicationName() { return publicationName; }

        public void setPublicationName(String publicationName) { this.publicationName = publicationName; }

        public String getAggregationType() { return aggregationType; }

        public void setAggregationType(String aggregationType) { this.aggregationType = aggregationType; }

        public String getSubtypeDescription() { return subtypeDescription; }

        public void setSubtypeDescription(String subtypeDescription) { this.subtypeDescription = subtypeDescription; }

        public String getAuthors() { return authors; }

        public void setAuthors(String authors) { this.authors = authors; }

        public List<ScopusLink> getLinks() { return links; }

        public void setLinks(List<ScopusLink> links) { this.links = links; }
    }

    public static class ScopusLink {

        @JsonProperty("@ref")
        private String ref;

        @JsonProperty("@href")
        private String href;

        public String getRef() { return ref; }

        public void setRef(String ref) { this.ref = ref; }

        public String getHref() { return href; }

        public void setHref(String href) { this.href = href; }
    }
}
