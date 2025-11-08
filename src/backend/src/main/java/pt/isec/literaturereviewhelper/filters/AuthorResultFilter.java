package pt.isec.literaturereviewhelper.filters;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import pt.isec.literaturereviewhelper.models.Article;
/**
 * A filter that accepts or rejects articles based on their authors.
 */
public final class AuthorResultFilter extends ResultFilterBase {
    private final Logger logger = LoggerFactory.getLogger(getClass());
    private final boolean reversed;
    private final List<String> authors;

    /**
     * Constructs a case insensitive AuthorResultFilter for the given authors.
     *
     * This is equivalent to calling {@link #AuthorResultFilter(List<String>, boolean)} with reversed set to false.
     *
     * @param authors the names of the authors to filter by
     * @see #AuthorResultFilter(List<String>, boolean)
     */
    public AuthorResultFilter(List<String> authors) {
        this(authors, false);
    }

    /**
     * Constructs a case insensitive AuthorResultFilter for the given authors.
     *
     * @param authors  the names of the authors to filter by
     * @param reversed whether included articles should not be authored by the specified author
     */
    public AuthorResultFilter(List<String> authors, boolean reversed) {
        this.reversed = reversed;
        this.authors = authors.stream().map(String::toLowerCase).toList();
    }

    @Override
    boolean filter(Article article) {
        if (article.authors() == null) {
            logger.warn("Excluding article '{}' due to missing authors.", article.title());
            return false;
        }

        if (reversed) {
            return article.authors().stream()
                    .noneMatch(a -> authors.stream().anyMatch(author -> a.toLowerCase().contains(author)));
        } else {
            return article.authors().stream()
                    .anyMatch(a -> authors.stream().anyMatch(author -> a.toLowerCase().contains(author)));
        }
    }

}
