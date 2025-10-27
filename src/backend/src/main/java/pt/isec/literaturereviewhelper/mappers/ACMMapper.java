package pt.isec.literaturereviewhelper.mappers;

import org.springframework.stereotype.Component;

import pt.isec.literaturereviewhelper.interfaces.IResultMapper;
import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.ACMResponse;
import pt.isec.literaturereviewhelper.models.Engines;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class ACMMapper implements IResultMapper<ACMResponse> {
    @Override
    public List<Article> map(ACMResponse response) {
        if (response == null ||
                response.getMessage() == null ||
                response.getMessage().getItems() == null) {
            return List.of();
        }

        return response.getMessage().getItems().stream()
                .filter(Objects::nonNull)
                .map(item -> {
                    // Title
                    String title = Optional.ofNullable(item.getTitle())
                            .filter(t -> !t.isEmpty())
                            .map(t -> t.get(0)
                                    .replace("\n", " ")
                                    .replaceAll("\\s+", " ")
                                    .trim())
                            .orElse("");

                    // Year: try publishedPrint, then publishedOnline
                    String year = Optional.ofNullable(item.getPublishedPrint())
                            .map(p -> extractYear(p.getDateParts()))
                            .orElseGet(() -> Optional.ofNullable(item.getPublishedOnline())
                                    .map(p -> extractYear(p.getDateParts()))
                                    .orElse(""));

                    // Authors
                    String authors = Optional.ofNullable(item.getAuthor())
                            .filter(a -> !a.isEmpty())
                            .map(list -> list.stream()
                                    .map(a -> String.format("%s %s",
                                            Optional.ofNullable(a.given()).orElse(""),
                                            Optional.ofNullable(a.family()).orElse("")).trim())
                                    .collect(Collectors.joining(", ")))
                            .orElse("");

                    // Venue
                    String venue = Optional.ofNullable(item.getContainerTitle())
                            .filter(v -> !v.isEmpty())
                            .map(v -> v.get(0))
                            .orElse("");

                    // Type
                    String type = Optional.ofNullable(item.getType()).orElse("");

                    // Link
                    String link = Optional.ofNullable(item.getLink())
                            .filter(l -> !l.isEmpty())
                            .map(l -> l.get(0).get("URL"))
                            .orElse("");

                    return new Article(title, year, venue, type, authors, link, Engines.ACM);
                })
                .collect(Collectors.toList());
    }

    private String extractYear(List<List<Integer>> dateParts) {
        if (dateParts == null || dateParts.isEmpty() || dateParts.get(0).isEmpty()) return "";
        return String.valueOf(dateParts.get(0).get(0));
    }
}
