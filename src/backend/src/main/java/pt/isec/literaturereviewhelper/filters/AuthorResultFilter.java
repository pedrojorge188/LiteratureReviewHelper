package pt.isec.literaturereviewhelper.filters;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import pt.isec.literaturereviewhelper.models.Article;
public class AuthorResultFilter extends ResultFilterBase {
    private final Logger logger = LoggerFactory.getLogger(getClass());
    private final boolean reversed;
    private final String author;

    /**
     * Constructs a case insensitive AuthorResultFilter for the given author.
     *
     * This is equivalent to calling {@link #AuthorResultFilter(String, boolean)} with reversed set to false.
     *
     * @param author The author name to filter by
     * @see #AuthorResultFilter(String, boolean)
     */
    public AuthorResultFilter(String author) {
        this(author, false);
    }

    /**
     * Constructs a case insensitive AuthorResultFilter for the given author.
     *
     * @param author   the author name to filter by
     * @param reversed whether included articles should not be authored by the specified author
     */
    public AuthorResultFilter(String author, boolean reversed) {
        this.reversed = reversed;
        this.author = author.toLowerCase();
    }

    @Override
    boolean filter(Article article) {
        if (article.authors() == null) {
            logger.warn("Excluding article '{}' due to missing authors.", article.title());
            return false;
        }

        if (reversed) {
            return article.authors().stream()
                    .noneMatch(a -> a.toLowerCase().contains(author));
        } else {
            return article.authors().stream()
                    .anyMatch(a -> a.toLowerCase().contains(author));
        }
    }

}
