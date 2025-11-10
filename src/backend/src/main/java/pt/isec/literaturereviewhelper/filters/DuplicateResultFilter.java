package pt.isec.literaturereviewhelper.filters;

import pt.isec.literaturereviewhelper.models.Article;
import java.util.HashSet;
import java.util.Set;

public class DuplicateResultFilter extends ResultFilterBase {

    private final Set<String> seenTitles = new HashSet<>();

    @Override
    boolean filter(Article article) {
        String processedTitle = getProcessedTitle(article.title());
        if (seenTitles.contains(processedTitle)) {
            return false;
        }
        seenTitles.add(processedTitle);
        return true;
    }

    private String getProcessedTitle(String title) {
        if (title == null) {
            return "";
        }
        return title.toLowerCase().replaceAll("[!@#$%^&*()_+\\-=\\[\\]{};:'\",.<>?/~`|\\\\]+", "");
    }
}
