package pt.isec.literaturereviewhelper.interfaces;

import pt.isec.literaturereviewhelper.models.Article;

import java.util.List;

public interface IResultMapper<R> {
    List<Article> map(R response);
}