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

    public Map<String, Map<Statistic, Integer>> getAllExecutionStatistics() {
        return allExecutionStatistics;
    }

    private final Map<String, Map<Statistic, Integer>> allExecutionStatistics = new HashMap<>();
    private int inputCount = Integer.MIN_VALUE;
    private int outputCount = Integer.MIN_VALUE;
    private int droppedCount = Integer.MIN_VALUE;

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
        inputCount = articles.size();
        outputCount = filteredArticles.size();
        droppedCount = inputCount - outputCount;
        return filteredArticles;
    }

    @Override
    public Map<Statistic, Integer> getExecutionStatistics() {
        if (inputCount == Integer.MIN_VALUE) {
            throw new IllegalStateException("Filter has not been executed yet.");
        }

        return Map.of(
                Statistic.INPUT, inputCount,
                Statistic.OUTPUT, outputCount,
                Statistic.DROPPED, droppedCount
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