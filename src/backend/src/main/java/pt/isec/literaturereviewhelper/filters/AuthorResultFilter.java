package pt.isec.literaturereviewhelper.filters;

import pt.isec.literaturereviewhelper.models.Article;
    public class AuthorResultFilter extends ResultFilterBase {
    private final String author;

    public AuthorResultFilter(String author) {
        this.author = author.toLowerCase();
    }

    @Override
    boolean filter(Article article) {
        if (article.authors() == null) {
            return false;
        }
        return article.authors().stream()
                .anyMatch(a -> a.toLowerCase().contains(author));
    }

}
