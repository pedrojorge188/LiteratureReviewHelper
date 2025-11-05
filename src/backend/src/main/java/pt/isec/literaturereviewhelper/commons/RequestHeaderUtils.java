package pt.isec.literaturereviewhelper.commons;

import java.util.Arrays;
import java.util.EnumMap;
import java.util.Map;
import java.util.stream.Collectors;

import pt.isec.literaturereviewhelper.models.Engines;

public final class RequestHeaderUtils {
    private RequestHeaderUtils() {}
    
    public static final String X_API_KEYS = "X-API-KEYS";

    /**
     * Parses a header string containing API keys for multiple engines into a Map.
     *
     * The header format should be: "GOOGLE=key1,REDDIT=key2,MEDIUM=key3"
     *
     * @param apiKeysHeader the header string with engine=key pairs separated by commas
     * @return a Map associating each Engines enum with its API key
     * @throws IllegalArgumentException if the engine name is invalid or the format is incorrect
     */
    public static Map<Engines, String> parseApiKeysHeader(String apiKeysHeader) {
        if (apiKeysHeader == null || apiKeysHeader.isBlank()) {
            return new EnumMap<>(Engines.class);
        }

        return Arrays.stream(apiKeysHeader.split(","))
                .map(s -> s.split("="))
                .filter(arr -> arr.length == 2)
                .collect(Collectors.toMap(
                        arr -> {
                            try {
                                return Engines.valueOf(arr[0].toUpperCase().trim());
                            } catch (IllegalArgumentException e) {
                                throw new IllegalArgumentException("Unsupported engine: " + arr[0], e);
                            }
                        },
                        arr -> arr[1].trim()
                ));
    }
}