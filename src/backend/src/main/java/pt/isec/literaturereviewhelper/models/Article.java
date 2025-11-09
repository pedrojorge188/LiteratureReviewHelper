package pt.isec.literaturereviewhelper.models;

import java.util.List;

import jakarta.validation.constraints.NotNull;

public record Article(String title, String publicationYear, String venue, String venueType, List<String> authors, String link,
                      Engines source) {

    @Override
    public @NotNull String toString() {
        return "\nArticle" + "\n{" +
                "\ttitle='" + title + "',\n" +
                "\tpublicationYear='" + publicationYear + "',\n" +
                "\tvenue='" + venue + "',\n" +
                "\tvenueType='" + venueType + "',\n" +
                "\tauthors='" + authors.stream().map(Object::toString).reduce((a, b) -> a + ", " + b).orElse("") + "',\n" +
                "\tlink='" + link + "',\n" +
                "\tsource='" + source + "'\n" +
                "}\n";
    }
}
