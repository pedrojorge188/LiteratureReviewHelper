package pt.isec.literaturereviewhelper.filters;

import pt.isec.literaturereviewhelper.models.Article;

/**
 * A filter that accepts or rejects articles based on their title.
 */
public class TitleResultFilter extends ResultFilterBase {
    private final boolean reversed;
    private final String title;

    /**
     * Constructs a case insensitive TitleResultFilter for the given title.
     *
     * This is equivalent to calling {@link #TitleResultFilter(String, boolean)} with reversed set to false.
     *
     * @param title the title to filter by
     * @see #TitleResultFilter(String, boolean)
     */
    public TitleResultFilter(String title) {
        this(title, false);
    }

    /**
     * Constructs a case insensitive TitleResultFilter for the given title.
     *
     * @param title    the title to filter by
     * @param reversed whether included articles should not match the specified title
     */
    public TitleResultFilter(String title, boolean reversed) {
        this.reversed = reversed;
        this.title = title.toLowerCase().strip();
    }

    @Override
    boolean filter(Article article) {
        if (reversed) {
            return !article.title().toLowerCase().equals(title);
        } else {
            return article.title().toLowerCase().equals(title);
        }
    }
}
