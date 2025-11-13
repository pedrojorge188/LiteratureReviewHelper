package pt.isec.literaturereviewhelper.dtos;

import java.util.List;
import java.util.Map;

import pt.isec.literaturereviewhelper.interfaces.IResultFilter;
import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.Engines;

public class SearchResponseDto {
    private String query;

    private int totalArticles;

    private Map<Engines, Integer> articlesByEngine;

    private int duplicatedResultsRemoved;

    private Map<Engines, Map<String, Map<IResultFilter.Statistic, Integer>>> filterImpactByEngine;

    private List<Article> articles;

    public SearchResponseDto(String query, 
        int totalArticles, 
        Map<Engines, Integer> articlesByEngine, 
        List<Article> articles, 
        int duplicatedResultsRemoved, 
        Map<Engines, Map<String, Map<IResultFilter.Statistic, Integer>>> filterImpactByEngine) {

        this.query = query;
        this.totalArticles = totalArticles;
        this.articlesByEngine = articlesByEngine;
        this.duplicatedResultsRemoved = duplicatedResultsRemoved;
        this.articles = articles;
        this.filterImpactByEngine = filterImpactByEngine;
    }

    public String getQuery() { return query; }

    public void setQuery(String query) { this.query = query; }

    public int getTotalArticles() { return totalArticles; }

    public void setTotalArticles(int totalArticles) { this.totalArticles = totalArticles; }

    public Map<Engines, Integer> getArticlesByEngine() { return articlesByEngine; }

    public void setArticlesByEngine(Map<Engines, Integer> articlesByEngine) { this.articlesByEngine = articlesByEngine; }

    public List<Article> getArticles() { return articles; }

    public void setArticles(List<Article> articles) { this.articles = articles; }

    public int getDuplicatedResultsRemoved() { return duplicatedResultsRemoved; }

    public void setDuplicatedResultsRemoved(int duplicatedResultsRemoved) { this.duplicatedResultsRemoved = duplicatedResultsRemoved; }

    public Map<Engines, Map<String, Map<IResultFilter.Statistic, Integer>>> getFilterImpactByEngine() { return filterImpactByEngine; }

    public void setFilterImpactByEngine(Map<Engines, Map<String, Map<IResultFilter.Statistic, Integer>>> filterImpactByEngine) { this.filterImpactByEngine = filterImpactByEngine; }

}
