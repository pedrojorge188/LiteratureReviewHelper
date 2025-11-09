package pt.isec.literaturereviewhelper.interfaces;

import java.util.List;
import java.util.Map;

import pt.isec.literaturereviewhelper.models.Article;

public interface IResultFilter {
    /**
     * Enumeration of statistics tracked during filter execution.
     *
     * - INPUT: Number of articles before filtering
     * - OUTPUT: Number of articles after filtering
     * - DROPPED: Number of articles excluded by the filter
     */
    enum Statistic {
        INPUT,
        OUTPUT,
        DROPPED
    }

    /**
     * Filters the provided list of articles according to the filter's criteria.
     *
     * @param articles the list of articles to filter
     * @return a list containing only the articles that satisfy the filter
     */
    List<Article> filter(List<Article> articles);


    /**
     * Returns a map containing statistics about the filter execution.
     *
     * @return Map where the key is the {@link Statistic} enum and the value is the count for that statistic
     */
    Map<Statistic, Integer> getExecutionStatistics();
}
