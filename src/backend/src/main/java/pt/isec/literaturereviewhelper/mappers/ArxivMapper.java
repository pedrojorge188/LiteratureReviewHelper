package pt.isec.literaturereviewhelper.mappers;

import org.springframework.stereotype.Component;
import pt.isec.literaturereviewhelper.interfaces.IResultMapper;
import pt.isec.literaturereviewhelper.models.ArxivResponse;
import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.Engines;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Component("arxivResultMapper")
public class ArxivMapper implements IResultMapper<ArxivResponse> {

    @Override
    public List<Article> map(ArxivResponse response) {
        if (response == null || response.getEntries() == null) {
            return Collections.emptyList();
        }

        return response.getEntries().stream()
                .filter(Objects::nonNull)
                .map(entry -> {
                    String title = Optional.ofNullable(entry.getTitle()).orElse("").trim();
                    String dateStr = Optional.ofNullable(entry.getPublished()).orElse(entry.getUpdated());
                    String year = (dateStr != null && dateStr.length() >= 4) ? dateStr.substring(0, 4) : "";

                    List<String> authors = Optional.ofNullable(entry.getAuthors())
                            .map(list -> list.stream()
                                    .map(ArxivResponse.Author::getName)
                                    .filter(Objects::nonNull)
                                    .map(String::trim)
                                    .toList())
                            .orElse(Collections.emptyList());

                    String link = Optional.ofNullable(entry.getId()).orElse("");

                    return new Article(
                            title,
                            year,
                            "arXiv",
                            "Preprint",
                            authors,
                            link,
                            Engines.ARXIV
                    );
                })
                .toList();
    }
}
