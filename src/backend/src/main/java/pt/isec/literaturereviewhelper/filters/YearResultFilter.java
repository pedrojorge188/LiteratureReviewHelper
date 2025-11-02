package pt.isec.literaturereviewhelper.filters;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import pt.isec.literaturereviewhelper.models.Article;

/**
 * Filter that includes only articles published within a specified year range.
 */
public final class YearResultFilter extends ResultFilterBase {
    private final Logger logger = LoggerFactory.getLogger(getClass());
    private final int minYear;
    private final int maxYear;

    public YearResultFilter(int minYear, int maxYear) {
        this.minYear = minYear;
        this.maxYear = maxYear;
    }

    @Override
    boolean filter(Article article) {
        if (article.publicationYear() == null) {
            logger.warn("Excluding article '{}' due to missing publication year.", article.title());
            return false;
        }
        int year = Integer.parseInt(article.publicationYear());
        return year >= minYear && year <= maxYear;
    }
}
