package pt.isec.literaturereviewhelper.interfaces;

import pt.isec.literaturereviewhelper.models.Article;

public interface IResultFilter {
    /**
     * Determines whether the provided Article matches the criteria defined by the filter.
     *
     * @param article the Article to evaluate
     * @return true if the article satisfies the filter and should be included, false otherwise
     */
    boolean filter(Article article);
}
