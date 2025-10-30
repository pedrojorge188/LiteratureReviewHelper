package pt.isec.literaturereviewhelper.filters;

import org.junit.jupiter.api.Test;
import pt.isec.literaturereviewhelper.interfaces.IResultFilter;
import pt.isec.literaturereviewhelper.models.Article;
import pt.isec.literaturereviewhelper.models.Engines;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ResultFilterChainTest {

    @Test
    void testConstructor_nullList_throwsNullPointerException() {
        assertThrows(NullPointerException.class, () -> new ResultFilterChain(null));
    }

    @Test
    void testEmptyFilterList_returnsTrue() {
        ResultFilterChain chain = new ResultFilterChain(Collections.emptyList());
        assertTrue(chain.filter(new Article("", "", "", "", List.of(), "", Engines.ACM)));
    }

    @Test
    void testAllFiltersPass_returnsTrue() {
        IResultFilter filter1 = article -> true;
        IResultFilter filter2 = article -> true;
        ResultFilterChain chain = new ResultFilterChain(Arrays.asList(filter1, filter2));

        assertTrue(chain.filter(new Article("", "", "", "", List.of(), "", Engines.ACM)));
    }

    @Test
    void testOneFilterFails_returnsFalse() {
        IResultFilter filter1 = article -> true;
        IResultFilter filter2 = article -> false;
        ResultFilterChain chain = new ResultFilterChain(Arrays.asList(filter1, filter2));

        assertFalse(chain.filter(new Article("", "", "", "", List.of(), "", Engines.ACM)));
    }
}
