package pt.isec.literaturereviewhelper.commons;

public final class Params {
    private Params() {}

    public static final String QUERY             = "q";
    public static final String START             = "start";
    public static final String ROWS              = "rows";
    public static final String WT                = "wt";
    public static final String API_KEY           = "api_key";
    public static final String DEEP_SEARCH_LIMIT = "deep_search_limit";
    public static final String YEAR_START        = "year_start";
    public static final String YEAR_END          = "year_end";
    public static final String AUTHOR            = "author";
    public static final String EXCLUDE_AUTHOR    = "exclude_author";
    public static final String VENUE             = "venue";
    public static final String EXCLUDE_VENUE     = "exclude_venue";
    public static final String TITLE             = "title";
    public static final String EXCLUDE_TITLE     = "exclude_title";

    /**
     * Delimiter used to separate multiple values in a single parameter.
     *
     * For example, to filter by multiple authors, the authors can be provided
     * as a single string separated by this delimiter.
     */
    public static final String VALUE_DELIMITER = ";";
}
