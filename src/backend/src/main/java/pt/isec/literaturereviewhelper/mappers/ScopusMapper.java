package pt.isec.literaturereviewhelper.mappers;

import org.springframework.stereotype.Component;

import pt.isec.literaturereviewhelper.interfaces.IResultMapper;
import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.Engines;
import pt.isec.literaturereviewhelper.models.ScopusResponse;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Component("scopusResultMapper")
public class ScopusMapper implements IResultMapper<ScopusResponse>{

    public List<Article> map(ScopusResponse response) {

        if (response == null
                || response.getSearchResults() == null
                || response.getSearchResults().getEntries() == null) {
            return Collections.emptyList();
        }

        return response.getSearchResults().getEntries()
                .stream()
                .map(entry -> {

                    // Title
                    String title = Optional.ofNullable(entry.getTitle()).orElse("");

                    // Extract year from date (format: yyyy-mm-dd)
                    String date = Optional.ofNullable(entry.getCoverDate()).orElse("");
                    String year = date.contains("-") ? date.split("-")[0] : date;

                    // Venue (Journal, Conference...)
                    String venue = Optional.ofNullable(entry.getPublicationName()).orElse("");

                    // Venue Type (prefer subtypeDescription)
                    String venueType = Optional.ofNullable(entry.getSubtypeDescription())
                            .orElse(Optional.ofNullable(entry.getAggregationType()).orElse(""));

                    // Authors: dc:creator is a single string that may contain multiple authors separated by ; or ,
                    List<String> authors = Optional.ofNullable(entry.getAuthors())
                                .map(a -> Arrays.stream(a.split("[;,]"))
                                .map(String::trim)
                                .filter(s -> !s.isBlank())
                                .toList())
                                .orElse(List.of());

                    // Link: find link with ref="scopus"
                    String link = "";
                    if (entry.getLinks() != null) {
                        link = entry.getLinks().stream()
                                .filter(l -> "scopus".equalsIgnoreCase(l.getRef()))
                                .map(l -> l.getHref())
                                .filter(Objects::nonNull)
                                .findFirst()
                                .orElse("");
                    }

                    return new Article(
                            title,
                            year,
                            venue,
                            venueType,
                            authors,
                            link,
                            Engines.SCOPUS
                    );
                })
                .toList();
    }
}
