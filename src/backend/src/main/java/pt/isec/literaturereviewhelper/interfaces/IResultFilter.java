package pt.isec.literaturereviewhelper.interfaces;

import java.util.List;

import pt.isec.literaturereviewhelper.models.Article;

public interface IResultFilter {
    /**
     * Filters the provided list of articles according to the filter's criteria.
     *
     * @param articles the list of articles to filter
     * @return a list containing only the articles that satisfy the filter
     */
    List<Article> filter(List<Article> articles);
}
