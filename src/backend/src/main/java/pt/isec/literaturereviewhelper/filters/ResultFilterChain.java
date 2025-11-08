package pt.isec.literaturereviewhelper.filters;

import pt.isec.literaturereviewhelper.interfaces.IResultFilter;
import pt.isec.literaturereviewhelper.models.Article;

import static pt.isec.literaturereviewhelper.commons.Params.AUTHOR;
import static pt.isec.literaturereviewhelper.commons.Params.TITLE;
import static pt.isec.literaturereviewhelper.commons.Params.VENUE;
import static pt.isec.literaturereviewhelper.commons.Params.YEAR_END;
import static pt.isec.literaturereviewhelper.commons.Params.YEAR_START;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
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

    public static class Builder {
        private final List<IResultFilter> filters = new ArrayList<>();

        public Builder fromParams(Map<String, String> params) {
            if (params.containsKey(YEAR_START) && params.containsKey(YEAR_END)) {
                int startYear = Integer.parseInt(params.get(YEAR_START));
                int endYear = Integer.parseInt(params.get(YEAR_END));
                filters.add(new YearResultFilter(startYear, endYear));
            }
            else if (params.containsKey(YEAR_END)) {
                int startYear = Integer.MIN_VALUE;
                int endYear = Integer.parseInt(params.get(YEAR_END));
                filters.add(new YearResultFilter(startYear, endYear));
            }
            else if (params.containsKey(YEAR_START)) {
                int startYear = Integer.parseInt(params.get(YEAR_START));
                int endYear = LocalDate.now().getYear();
                filters.add(new YearResultFilter(startYear, endYear));
            }

            if (params.containsKey(AUTHOR)) {
                filters.add(new AuthorResultFilter(params.get(AUTHOR)));
            }

            if (params.containsKey(VENUE)) {
                filters.add(new VenueResultFilter(params.get(VENUE)));
            }

            if (params.containsKey(TITLE)) {
                filters.add(new TitleResultFilter(params.get(TITLE)));
            }

            return this;
        }

        public ResultFilterChain build() {
            return new ResultFilterChain(filters);
        }
    }
}
