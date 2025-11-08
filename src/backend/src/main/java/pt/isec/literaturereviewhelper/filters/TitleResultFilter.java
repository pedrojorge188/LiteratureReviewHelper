package pt.isec.literaturereviewhelper.filters;

import java.util.List;

import pt.isec.literaturereviewhelper.models.Article;

/**
 * A filter that accepts or rejects articles based on their title.
 */
public class TitleResultFilter extends ResultFilterBase {
    private final boolean reversed;
    private final List<String> titles;

    /**
     * Constructs a case insensitive TitleResultFilter for the given title.
     *
     * This is equivalent to calling {@link #TitleResultFilter(List<String>, boolean)} with reversed set to false.
     *
     * @param titles the titles to filter by
     * @see #TitleResultFilter(List<String>, boolean)
     */
    public TitleResultFilter(List<String> titles) {
        this(titles, false);
    }

    /**
     * Constructs a case insensitive TitleResultFilter for the given titles.
     *
     * @param titles   the titles to filter by
     * @param reversed whether included articles should not match the specified title
     */
    public TitleResultFilter(List<String> titles, boolean reversed) {
        this.reversed = reversed;
        this.titles = titles.stream().map(String::toLowerCase).map(String::strip).toList();
    }

    @Override
    boolean filter(Article article) {
        if (reversed) {
            return titles.stream().noneMatch(title -> article.title().toLowerCase().equals(title));
        } else {
            return titles.stream().anyMatch(title -> article.title().toLowerCase().equals(title));
        }
    }
}
