package pt.isec.literaturereviewhelper.filters;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import pt.isec.literaturereviewhelper.models.Article;

/**
 * A filter that accepts or rejects articles based on their venue.
 */
public class VenueResultFilter extends ResultFilterBase {
    private final Logger logger = LoggerFactory.getLogger(getClass());
    private final boolean reversed;
    private final String venue;

    /**
     * Constructs a case insensitive VenueResultFilter for the given venue.
     *
     * This is equivalent to calling {@link #VenueResultFilter(String, boolean)} with reversed set to false.
     *
     * @param venue the name of the venue to filter by
     * @see #VenueResultFilter(String, boolean)
     */
    public VenueResultFilter(String venue) {
        this(venue, false);
    }

    /**
     * Constructs a case insensitive VenueResultFilter for the given venue.
     *
     * @param venue    the name of the venue to filter by
     * @param reversed whether included articles should not be from the specified venue
     */
    public VenueResultFilter(String venue, boolean reversed) {
        this.reversed = reversed;
        this.venue = venue.toLowerCase().strip();
    }

    @Override
    boolean filter(Article article) {
        if (article.venue() == null) {
            logger.warn("Excluding article '{}' due to missing venue.", article.title());
            return false;
        }

        /**
         * Using contains to allow partial matches (e.g., "IEEE International Conference on Software Architecture"
         * matches "2017 IEEE International Conference on Software Architecture").
         */
        if (reversed) {
            return !article.venue().toLowerCase().contains(venue);
        } else {
            return article.venue().toLowerCase().contains(venue);
        }
    }
}
