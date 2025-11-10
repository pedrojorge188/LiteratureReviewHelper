package pt.isec.literaturereviewhelper.filters;

import pt.isec.literaturereviewhelper.interfaces.IResultFilter;
import pt.isec.literaturereviewhelper.models.Article;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import static pt.isec.literaturereviewhelper.commons.Params.AUTHOR;
import static pt.isec.literaturereviewhelper.commons.Params.EXCLUDE_AUTHOR;
import static pt.isec.literaturereviewhelper.commons.Params.EXCLUDE_TITLE;
import static pt.isec.literaturereviewhelper.commons.Params.EXCLUDE_VENUE;
import static pt.isec.literaturereviewhelper.commons.Params.TITLE;
import static pt.isec.literaturereviewhelper.commons.Params.VALUE_DELIMITER;
import static pt.isec.literaturereviewhelper.commons.Params.VENUE;
import static pt.isec.literaturereviewhelper.commons.Params.YEAR_END;
import static pt.isec.literaturereviewhelper.commons.Params.YEAR_START;

/**
 * Simple filter chain that applies multiple filters in sequence.
 * Every filter must pass for the article to be accepted.
 */
public final class ResultFilterChain implements IResultFilter {
    private final List<IResultFilter> filters;
    private final Map<String, Map<Statistic, Integer>> allExecutionStatistics = new HashMap<>();
    private boolean filtered = false;

    public ResultFilterChain(List<IResultFilter> filters) {
        this.filters = new ArrayList<>(Objects.requireNonNull(filters));
    }

    @Override
    public List<Article> filter(List<Article> articles) {
        List<Article> filteredArticles = articles;
        for (IResultFilter f : filters) {
            filteredArticles = f.filter(filteredArticles);
            allExecutionStatistics.put(f.getClass().getSimpleName(), f.getExecutionStatistics());
        }
        this.filtered = true;
        return filteredArticles;
    }

    @Override
    public Map<Statistic, Integer> getExecutionStatistics() {
        if (!filtered) {
            throw new IllegalStateException("Cannot get execution statistics before filter() has been called.");
        }

        int totalInput = 0;
        int totalOutput = 0;
        int totalDropped = 0;

        for (Map<Statistic, Integer> stats : allExecutionStatistics.values()) {
            totalInput += stats.getOrDefault(Statistic.INPUT, 0);
            totalOutput += stats.getOrDefault(Statistic.OUTPUT, 0);
            totalDropped += stats.getOrDefault(Statistic.DROPPED, 0);
        }

        return Map.of(
                Statistic.INPUT, totalInput,
                Statistic.OUTPUT, totalOutput,
                Statistic.DROPPED, totalDropped
        );
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
                List<String> authors = List.of(params.get(AUTHOR).split(VALUE_DELIMITER));
                filters.add(new AuthorResultFilter(authors));
            }

            if (params.containsKey(EXCLUDE_AUTHOR)) {
                List<String> authors = List.of(params.get(EXCLUDE_AUTHOR).split(VALUE_DELIMITER));
                filters.add(new AuthorResultFilter(authors, true));
            }

            if (params.containsKey(VENUE)) {
                List<String> venues = List.of(params.get(VENUE).split(VALUE_DELIMITER));
                filters.add(new VenueResultFilter(venues));
            }

            if (params.containsKey(EXCLUDE_VENUE)) {
                List<String> venues = List.of(params.get(EXCLUDE_VENUE).split(VALUE_DELIMITER));
                filters.add(new VenueResultFilter(venues, true));
            }

            if (params.containsKey(TITLE)) {
                List<String> titles = List.of(params.get(TITLE).split(VALUE_DELIMITER));
                filters.add(new TitleResultFilter(titles));
            }

            if (params.containsKey(EXCLUDE_TITLE)) {
                List<String> titles = List.of(params.get(EXCLUDE_TITLE).split(VALUE_DELIMITER));
                filters.add(new TitleResultFilter(titles, true));
            }

            filters.add(new DuplicateResultFilter());

            return this;
        }

        public ResultFilterChain build() {
            return new ResultFilterChain(filters);
        }
    }
}