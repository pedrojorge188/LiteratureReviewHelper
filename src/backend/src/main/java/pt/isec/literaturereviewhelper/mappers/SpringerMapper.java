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

        return response.getRecords().stream().map(rec -> {
            // Title
            String title = Optional.ofNullable(rec.getTitle())
                    .map(s -> s.replace("\n", " ").trim())
                    .orElse("");

            // Year
            String pubDate = Optional.ofNullable(rec.getPublicationDate()).orElse("");
            String year = pubDate.contains("-") ? pubDate.split("-")[0] : pubDate;

            // Venue and type
            String venue = Optional.ofNullable(rec.getPublicationName()).orElse("");
            String venueType = Optional.ofNullable(rec.getContentType()).orElse("");

            // Authors
            List<String> authors = List.of();
            if (rec.getCreators() != null) {
                authors = rec.getCreators().stream()
                        .filter(Objects::nonNull)
                        .map(SpringerResponse.Creator::getName)
                        .filter(s -> s != null && !s.isBlank())
                        .collect(Collectors.toList());
            }

            // Link
            String link = "";
            if (rec.getUrl() != null && !rec.getUrl().isEmpty()) {
                link = Optional.ofNullable(rec.getUrl().get(0).getValue()).orElse("");
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
        }).toList();
    }
}
