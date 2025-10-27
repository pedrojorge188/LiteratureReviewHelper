package pt.isec.literaturereviewhelper.interfaces;

import pt.isec.literaturereviewhelper.models.Engines;

public interface ISearchEngineFactory {
    ISearchEngine createSearchEngine(Engines type);
}