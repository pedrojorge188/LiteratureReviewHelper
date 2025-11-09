package pt.isec.literaturereviewhelper.filters;

import pt.isec.literaturereviewhelper.models.Article;

public final class NoOpResultFilter extends ResultFilterBase {
    @Override
    public boolean filter(Article article) {
        return true;
    }
}
