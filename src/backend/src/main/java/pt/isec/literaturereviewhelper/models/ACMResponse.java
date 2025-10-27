package pt.isec.literaturereviewhelper.models;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

public class ACMResponse {
    private Message message;

    public Message getMessage() { return message; }
    public void setMessage(Message message) { this.message = message; }

    public static class Message {
        private List<Item> items;

        public List<Item> getItems() { return items; }
        public void setItems(List<Item> items) { this.items = items; }
    }

    /**
     * ACM Response Model. This is what we want for the frontend.
     */
    public static class Item {
        private List<String> title;

        @JsonProperty("published-print")
        private PublishedDate publishedPrint;

        @JsonProperty("published-online")
        private PublishedDate publishedOnline;

        private List<Author> author;

        @JsonProperty("container-title")
        private List<String> containerTitle;

        private String type;
        private List<Map<String, String>> link;

        public List<String> getTitle() { return title; }
        public List<Author> getAuthor() { return author; }
        public List<String> getContainerTitle() { return containerTitle; }
        public String getType() { return type; }
        public List<Map<String, String>> getLink() { return link; }
        public PublishedDate getPublishedPrint() { return publishedPrint; }
        public PublishedDate getPublishedOnline() { return publishedOnline; }

        public void setTitle(List<String> strings) { this.title = strings; }
        public void setType(String type) { this.type = type; }
        public void setContainerTitle(List<String> containerTitle) { this.containerTitle = containerTitle; }
        public void setAuthor(List<Author> authors) { this.author = authors; }
        public void setPublishedPrint(PublishedDate publishedPrint) { this.publishedPrint = publishedPrint; }
        public void setPublishedOnline(PublishedDate publishedOnline) { this.publishedPrint = publishedOnline; }
        public void setLink(List<Map<String, String>> link) { this.link = link; }
    }

    public record Author(String given, String family) {}

    public static class PublishedDate {
        @JsonProperty("date-parts")
        private List<List<Integer>> dateParts;

        public PublishedDate(List<List<Integer>> dateParts) { this.dateParts = dateParts; }

        public List<List<Integer>> getDateParts() { return dateParts; }
    }
}