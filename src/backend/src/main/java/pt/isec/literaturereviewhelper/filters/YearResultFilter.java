package pt.isec.literaturereviewhelper.filters;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import pt.isec.literaturereviewhelper.models.Article;


/**
 * A filter that accepts or rejects articles based on their publication year.
 */
public final class YearResultFilter extends ResultFilterBase {
    private final Logger logger = LoggerFactory.getLogger(getClass());
    private final boolean reversed;
    private final int minYear;
    private final int maxYear;

    /**
     * Constructs a YearResultFilter that accepts results within the specified year range.
     *
     * This is equivalent to calling {@link #YearResultFilter(int,int,boolean)} with reversed set to false.
     *
     * @param minYear the minimum year (inclusive) of the range to accept
     * @param maxYear the maximum year (inclusive) of the range to accept
     * @see #YearResultFilter(int,int,boolean)
     */
    public YearResultFilter(int minYear, int maxYear) {
        this(minYear, maxYear, false);
    }

    /**
     * Constructs a new YearResultFilter with specified year range.
     *
     * @param minYear  the minimum year (inclusive) for filtering results
     * @param maxYear  the maximum year (inclusive) for filtering results
     * @param reversed whether included articles should be outside the specified year range
     */
    public YearResultFilter(int minYear, int maxYear, boolean reversed) {
        this.reversed = reversed;
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
        if (reversed) {
            return year < minYear || year > maxYear;
        } else {
            return year >= minYear && year <= maxYear;
        }
    }
}
