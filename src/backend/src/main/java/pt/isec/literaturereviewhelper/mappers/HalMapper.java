package pt.isec.literaturereviewhelper.mappers;

import org.jbibtex.*;
import org.springframework.stereotype.Component;
import pt.isec.literaturereviewhelper.interfaces.IResultMapper;
import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.Engines;
import pt.isec.literaturereviewhelper.models.HalResponse;

import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Component("halResultMapper")
public class HalMapper implements IResultMapper<String> {
    private static final String AND_SPLIT = " and ";

    @Override
    public List<Article> map(String bibtexData) {
        if (bibtexData == null || bibtexData.isBlank()) return List.of();

        HalResponse model = parseBibtex(bibtexData);

        List<Article> out = new ArrayList<>();
        for (HalResponse.Entry e : model.getEntries()) {
            String title = safe(e.getTitle()).replace("{", "").replace("}", "");
            List<String> authors = e.getAuthors();
            String year = safe(e.getYear());
            String venue = e.computeVenue();
            String venueType = e.computeVenueType();
            String link = safe(e.getUrl());

            out.add(new Article(
                    title,
                    year,
                    venue,
                    venueType,
                    authors,
                    link,
                    Engines.HAL
            ));
        }
        return out;
    }

    private String safe(String s) { return s == null ? "" : s; }

    /**
     * Parses BibTeX to HalResponse using jbibtex. Uses old logic.
     */
    private HalResponse parseBibtex(String bibtexData) {
        HalResponse response = new HalResponse();
        try {
            BibTeXParser parser = new BibTeXParser();
            BibTeXDatabase db = parser.parse(new StringReader(bibtexData));

            for (BibTeXEntry entry : db.getEntries().values()) {
                HalResponse.Entry e = new HalResponse.Entry();

                // Title
                e.setTitle(getField(entry, "TITLE")
                        .replace("{", "").replace("}", ""));

                // Authors: split
                String rawAuthors = getField(entry, "AUTHOR");
                if (!rawAuthors.isBlank()) {
                    // BibTeX joins authors
                    String[] arr = rawAuthors.split(Pattern.quote(AND_SPLIT));
                    for (String a : arr) {
                        String cleaned = a.trim();
                        if (!cleaned.isBlank()) e.getAuthors().add(cleaned);
                    }
                }

                // Year
                e.setYear(getField(entry, "YEAR"));

                // Venue: JOURNAL > BOOKTITLE > SCHOOL > PUBLISHER
                e.setJournal(getField(entry, "JOURNAL"));
                e.setBooktitle(getField(entry, "BOOKTITLE"));
                e.setSchool(getField(entry, "SCHOOL"));
                e.setPublisher(getField(entry, "PUBLISHER"));

                // Entry type (raw bibtex type)
                if (entry.getType() != null && entry.getType().getValue() != null) {
                    e.setType(entry.getType().getValue());
                }

                // Link
                e.setUrl(getField(entry, "URL"));

                response.addEntry(e);
            }
        } catch (Exception ignored) {
            // It won't throw an error here because parsing failures or malformed BibTeX won't throw nor crash.
            // Returning an empty HalResponse is valid because it's treated on the caller side.
        }
        return response;
    }

    private String getField(BibTeXEntry entry, String key) {
        Value v = entry.getField(new Key(key));
        return v == null ? "" : v.toUserString();
    }
}
