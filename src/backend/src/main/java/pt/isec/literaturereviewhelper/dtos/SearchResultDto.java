package pt.isec.literaturereviewhelper.dtos;

import pt.isec.literaturereviewhelper.interfaces.IResultFilter;
import pt.isec.literaturereviewhelper.models.Article;

import java.util.List;
import java.util.Map;

public class SearchResultDto {
    private final List<Article> articles;
    private final Map<String, Map<IResultFilter.Statistic, Integer>> statistics;

    public SearchResultDto(List<Article> articles, Map<String, Map<IResultFilter.Statistic, Integer>> statistics) {
        this.articles = articles;
        this.statistics = statistics;
    }

    public List<Article> getArticles() {
        return articles;
    }

    public Map<String, Map<IResultFilter.Statistic, Integer>> getStatistics() {
        return statistics;
    }
}
