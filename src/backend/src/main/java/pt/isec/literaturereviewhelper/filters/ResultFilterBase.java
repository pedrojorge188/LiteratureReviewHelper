package pt.isec.literaturereviewhelper.filters;

import java.util.List;

import pt.isec.literaturereviewhelper.interfaces.IResultFilter;
import pt.isec.literaturereviewhelper.models.Article;

/**
 * Abstract base class for result filters that provides default handling of list inputs.
 */
public abstract class ResultFilterBase implements IResultFilter {
    @Override
    public List<Article> filter(List<Article> articles) {
        return articles.stream()
                .filter(this::filter)
                .toList();
    }

    abstract boolean filter(Article article);
}
