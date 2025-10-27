package pt.isec.literaturereviewhelper.models;

public record Article(String title, String publicationYear, String venue, String venueType, String authors, String link,
                      Engines source) {

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
