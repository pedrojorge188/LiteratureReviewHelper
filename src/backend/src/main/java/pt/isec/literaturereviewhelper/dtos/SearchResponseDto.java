package pt.isec.literaturereviewhelper.dtos;

import java.util.List;
import java.util.Map;

import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.Engines;

public class SearchResponseDto {
    private String query;

    private int totalArticles;

    private Map<Engines, Integer> articlesByEngine;

    private int duplicatedResultsRemoved;

    private List<Article> articles;

    public SearchResponseDto(String query, int totalArticles, Map<Engines, Integer> articlesByEngine, List<Article> articles, int duplicatedResultsRemoved) {
        this.query = query;
        this.totalArticles = totalArticles;
        this.articlesByEngine = articlesByEngine;
        this.duplicatedResultsRemoved = duplicatedResultsRemoved;
        this.articles = articles;
    }

    public String getQuery() { return query; }

    public void setQuery(String query) { this.query = query; }

    public int getTotalArticles() { return totalArticles; }

    public void setTotalArticles(int totalArticles) { this.totalArticles = totalArticles; }

    public Map<Engines, Integer> getArticlesByEngine() { return articlesByEngine; }

    public void setArticlesByEngine(Map<Engines, Integer> articlesByEngine) { this.articlesByEngine = articlesByEngine; }

    public List<Article> getArticles() { return articles; }

    public void setArticles(List<Article> articles) { this.articles = articles; }

    public int getDuplicatedResultsRemoved() {
        return duplicatedResultsRemoved;
    }

    public void setDuplicatedResultsRemoved(int duplicatedResultsRemoved) { this.duplicatedResultsRemoved = duplicatedResultsRemoved; }

}
