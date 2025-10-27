package pt.isec.literaturereviewhelper.mappers;

import org.springframework.stereotype.Component;
import pt.isec.literaturereviewhelper.interfaces.IResultMapper;
import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.Engines;
import pt.isec.literaturereviewhelper.models.SpringerResponse;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Component("springerResultMapper")
public class SpringerMapper implements IResultMapper<SpringerResponse> {
    @Override
    public List<Article> map(SpringerResponse response) {
        if (response == null || response.getRecords() == null)
            return Collections.emptyList();

        return response.getRecords().stream().map(record -> {
            // Title
            String title = Optional.ofNullable(record.getTitle())
                    .map(s -> s.replace("\n", " ").trim())
                    .orElse("");

            // Year
            String pubDate = Optional.ofNullable(record.getPublicationDate()).orElse("");
            String year = pubDate.contains("-") ? pubDate.split("-")[0] : pubDate;

            // Venue and type
            String venue = Optional.ofNullable(record.getPublicationName()).orElse("");
            String venueType = Optional.ofNullable(record.getContentType()).orElse("");

            // Authors
            String authors = "";
            if (record.getCreators() != null) {
                authors = record.getCreators().stream()
                        .filter(Objects::nonNull)
                        .map(SpringerResponse.Creator::getCreator)
                        .filter(s -> s != null && !s.isBlank())
                        .collect(Collectors.joining(", "));
            }

            // Link
            String link = "";
            if (record.getUrl() != null && !record.getUrl().isEmpty()) {
                link = Optional.ofNullable(record.getUrl().get(0).getValue()).orElse("");
            }

            return new Article(
                    title,
                    year,
                    venue,
                    venueType,
                    authors,
                    link,
                    Engines.SPRINGER
            );
        }).collect(Collectors.toList());
    }
}