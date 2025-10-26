
package pt.isec.literaturereviewhelper.interfaces;

public interface ISearchEngineFactory {

    ISearchEngine getSearchEngine(String engineName);
}