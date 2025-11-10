package pt.isec.literaturereviewhelper.filters;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import pt.isec.literaturereviewhelper.models.Article;

/**
 * A filter that accepts or rejects articles based on their venues.
 */
public class VenueResultFilter extends ResultFilterBase {
    private final Logger logger = LoggerFactory.getLogger(getClass());
    private final boolean reversed;
    private final List<String> venues;

    /**
     * Constructs a case insensitive VenueResultFilter for the given venues.
     *
     * This is equivalent to calling {@link #VenueResultFilter(List<String>, boolean)} with reversed set to false.
     *
     * @param venues the names of the venues to filter by
     * @see #VenueResultFilter(List<String>, boolean)
     */
    public VenueResultFilter(List<String> venues) {
        this(venues, false);
    }

    /**
     * Constructs a case insensitive VenueResultFilter for the given venue.
     *
     * @param venues   the names of the venues to filter by
     * @param reversed whether included articles should not be from the specified venue
     */
    public VenueResultFilter(List<String> venues, boolean reversed) {
        this.reversed = reversed;
        this.venues = venues.stream().map(String::toLowerCase).map(String::strip).toList();
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
            return venues.stream().noneMatch(venue -> article.venue().toLowerCase().contains(venue));
        } else {
            return venues.stream().anyMatch(venue -> article.venue().toLowerCase().contains(venue));
        }
    }
}
