package pt.isec.literaturereviewhelper.filters;

import java.util.List;
import java.util.Map;

import pt.isec.literaturereviewhelper.interfaces.IResultFilter;
import pt.isec.literaturereviewhelper.models.Article;

/**
 * Abstract base class for result filters that provides default handling of list inputs.
 */
public abstract class ResultFilterBase implements IResultFilter {
    private int inputCount = Integer.MIN_VALUE;
    private int outputCount = Integer.MIN_VALUE;
    private int droppedCount = Integer.MIN_VALUE;

    @Override
    public List<Article> filter(List<Article> articles) {
        List<Article> filtered = articles.stream()
                .filter(this::filter)
                .toList();

        inputCount = articles.size();
        outputCount = filtered.size();
        droppedCount = inputCount - outputCount;

        return filtered;
    }

    abstract boolean filter(Article article);

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
}
