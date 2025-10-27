package pt.isec.literaturereviewhelper.models;

import java.util.ArrayList;
import java.util.List;

public class HalResponse {
    private final List<Entry> entries = new ArrayList<>();

    public List<Entry> getEntries() {
        return entries;
    }

    public void addEntry(Entry e) {
        if (e != null) entries.add(e);
    }

    public static class Entry {
        private String title = "";
        private List<String> authors = new ArrayList<>();
        private String year = "";
        private String journal = "";
        private String booktitle = "";
        private String school = "";
        private String publisher = "";
        private String type = "";
        private String url = "";

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public List<String> getAuthors() {
            return authors;
        }

        public void setAuthors(List<String> authors) {
            this.authors = authors;
        }

        public String getYear() {
            return year;
        }

        public void setYear(String year) {
            this.year = year;
        }

        public String getJournal() {
            return journal;
        }

        public void setJournal(String journal) {
            this.journal = journal;
        }

        public String getBooktitle() {
            return booktitle;
        }

        public void setBooktitle(String booktitle) {
            this.booktitle = booktitle;
        }

        public String getSchool() {
            return school;
        }

        public void setSchool(String school) {
            this.school = school;
        }

        public String getPublisher() {
            return publisher;
        }

        public void setPublisher(String publisher) {
            this.publisher = publisher;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public String computeVenue() {
            if (journal != null && !journal.isBlank()) return journal;
            if (booktitle != null && !booktitle.isBlank()) return booktitle;
            if (school != null && !school.isBlank()) return school;
            if (publisher != null && !publisher.isBlank()) return publisher;
            return "";
        }

        public String computeVenueType() {
            String t = type == null ? "" : type.toLowerCase();
            return switch (t) {
                case "inproceedings" -> "Conference Proceedings";
                case "phdthesis" -> "PhD Thesis";
                case "article" -> "Journal Article";
                case "unpublished" -> "Unpublished";
                case "book" -> "Book";
                case "incollection" -> "Book Chapter";
                case "mastersthesis" -> "Master's Thesis";
                default -> "";
            };
        }
    }
}
