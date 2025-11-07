package pt.isec.literaturereviewhelper.dtos;

import java.util.List;
import java.util.Map;

import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.Engines;

public class SearchResponseDto {
    private String query;

    private int totalArticles;

    private Map<Engines, Integer> articlesByEngine;

    private int articlesDuplicatedRemoved;

    private List<Article> articles;


    public SearchResponseDto(String query, int totalArticles, Map<Engines, Integer> articlesByEngine, List<Article> articles, int articlesDuplicatedRemoved) {
        this.query = query;
        this.totalArticles = totalArticles;
        this.articlesByEngine = articlesByEngine;
        this.articlesDuplicatedRemoved = articlesDuplicatedRemoved;
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

    public int getArticlesDuplicatedRemoved() {
        return articlesDuplicatedRemoved;
    }

    public void setArticlesDuplicatedRemoved(int articlesDuplicatedRemoved) { this.articlesDuplicatedRemoved = articlesDuplicatedRemoved; }
}
