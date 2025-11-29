package pt.isec.literaturereviewhelper.mappers;

import org.springframework.stereotype.Component;
import pt.isec.literaturereviewhelper.interfaces.IResultMapper;
import pt.isec.literaturereviewhelper.models.ArxivResponse;
import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.Engines;

import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Component("arxivResultMapper")
public class ArxivMapper implements IResultMapper<ArxivResponse> {

    @Override
    public List<Article> map(ArxivResponse response) {

        if (response == null || response.getEntries() == null)
            return Collections.emptyList();

        return response.getEntries().stream().map(entry -> {

            String title = entry.getTitle() != null ? entry.getTitle().trim() : "";

            String year = "";
            if (entry.getPublished() != null && entry.getPublished().length() >= 4) {
                year = entry.getPublished().substring(0, 4);
            }

            List<String> authors = entry.getAuthors() != null
                    ? entry.getAuthors().stream()
                        .map(ArxivResponse.Author::getName)
                        .filter(Objects::nonNull)
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .toList()
                    : Collections.emptyList();

            return new Article(
                    title,
                    year,
                    "arXiv",
                    "Preprint",
                    authors,
                    entry.getId(),
                    Engines.ARXIV
            );

        }).toList();
    }
}

