package pt.isec.literaturereviewhelper.filters;

import pt.isec.literaturereviewhelper.interfaces.IResultFilter;
import pt.isec.literaturereviewhelper.models.Article;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Simple filter chain that applies multiple filters in sequence.
 * Every filter must pass for the article to be accepted.
 */
public final class ResultFilterChain implements IResultFilter {
    private final List<IResultFilter> filters;

    public ResultFilterChain(List<IResultFilter> filters) {
        this.filters = new ArrayList<>(Objects.requireNonNull(filters));
    }

    @Override
    public List<Article> filter(List<Article> articles) {
        List<Article> filtered = articles;
        for (IResultFilter f : filters) {
            filtered = f.filter(filtered);
        }
        return filtered;
    }
}
