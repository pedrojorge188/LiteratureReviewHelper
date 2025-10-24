package pt.isec.literaturereviewhelper.model;


public class Article {

    private String title;
    private String publicationYear;
    private String venue;
    private String venueType;
    private String authors;
    private String link;
    private String source; // e.g., "Springer", "ACM", "HAL"

//    public Article() {
//    }

    public Article(String title, String publicationYear, String venue,
                   String venueType, String authors, String link, String source) {
        this.title = title;
        this.publicationYear = publicationYear;
        this.venue = venue;
        this.venueType = venueType;
        this.authors = authors;
        this.link = link;
        this.source = source;
    }

    // Getters and Setters
    public String getTitle() { return title; }
//    public void setTitle(String title) { this.title = title; }

    public String getPublicationYear() { return publicationYear; }
//    public void setPublicationYear(String publicationYear) { this.publicationYear = publicationYear; }

    public String getVenue() { return venue; }
//    public void setVenue(String venue) { this.venue = venue; }

    public String getVenueType() { return venueType; }
//    public void setVenueType(String venueType) { this.venueType = venueType; }

    public String getAuthors() { return authors; }
//    public void setAuthors(String authors) { this.authors = authors; }

    public String getLink() { return link; }
//    public void setLink(String link) { this.link = link; }

    public String getSource() { return source; }
//    public void setSource(String source) { this.source = source; }

    @Override
    public String toString() {
        return "\nArticle" + "\n{" +
                "\ttitle='" + title + "',\n" +
                "\tpublicationYear='" + publicationYear + "',\n" +
                "\tvenue='" + venue + "',\n" +
                "\tvenueType='" + venueType + "',\n" +
                "\tauthors='" + authors + "',\n" +
                "\tlink='" + link + "',\n" +
                "\tsource='" + source + "'\n" +
                "}\n";
    }
}
