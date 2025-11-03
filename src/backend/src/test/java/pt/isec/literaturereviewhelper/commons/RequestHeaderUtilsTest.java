package pt.isec.literaturereviewhelper.commons;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;

import org.junit.jupiter.api.Test;

import pt.isec.literaturereviewhelper.models.Engines;

class RequestHeaderUtilsTest {
    
    @Test
    void testParseApiKeysHeaderValidSingleEngine() {
        String header = "ACM=key1";

        Map<Engines, String> result = RequestHeaderUtils.parseApiKeysHeader(header);

        assertEquals(1, result.size());
        assertEquals("key1", result.get(Engines.ACM));
    }

    @Test
    void testParseApiKeysHeaderMultipleEngines() {
        String header = "ACM=key1,HAL=key2,SPRINGER=key3";

        Map<Engines, String> result = RequestHeaderUtils.parseApiKeysHeader(header);

        assertEquals(3, result.size());
        assertEquals("key1", result.get(Engines.ACM));
        assertEquals("key2", result.get(Engines.HAL));
        assertEquals("key3", result.get(Engines.SPRINGER));
    }

    @Test
    void testParseApiKeysHeaderWithSpaces() {
        String header = " ACM = key1 , HAL = key2 , SPRINGER=key3 ";

        Map<Engines, String> result = RequestHeaderUtils.parseApiKeysHeader(header);

        assertEquals(3, result.size());
        assertEquals("key1", result.get(Engines.ACM));
        assertEquals("key2", result.get(Engines.HAL));
        assertEquals("key3", result.get(Engines.SPRINGER));
    }

    @Test
    void testParseApiKeysHeaderNullHeaderReturnsEmptyMap() {
        String header = null;

        Map<Engines, String> result = RequestHeaderUtils.parseApiKeysHeader(header);

        assertEquals(0, result.size());
    }

    @Test
    void testParseApiKeysHeaderBlankHeaderReturnsEmptyMap() {
        String header = "   ";

        Map<Engines, String> result = RequestHeaderUtils.parseApiKeysHeader(header);

        assertEquals(0, result.size());
    }

    @Test
    void testParseApiKeysHeaderInvalidEngineThrowsException() {
        String header = "ACM=key1,INVALID=keyX";

        IllegalArgumentException exception = assertThrows(
            IllegalArgumentException.class,
            () -> RequestHeaderUtils.parseApiKeysHeader(header)
        );

        assertTrue(exception.getMessage().contains("Unsupported engine: INVALID"));
    }

    @Test
    void testParseApiKeysHeaderIgnoresMalformedEntries() {
        String header = "ACM=key1,INVALIDENTRY,HAL=key2";

        Map<Engines, String> result = RequestHeaderUtils.parseApiKeysHeader(header);

        assertEquals(2, result.size());
        assertEquals("key1", result.get(Engines.ACM));
        assertEquals("key2", result.get(Engines.HAL));
    }
}
