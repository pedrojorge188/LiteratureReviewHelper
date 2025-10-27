package pt.isec.literaturereviewhelper;

import org.junit.jupiter.api.Test;
import org.springframework.boot.builder.SpringApplicationBuilder;

import static org.junit.jupiter.api.Assertions.*;

class ServletInitializerTest {
    @Test
    void testConfigureReturnsBuilder() {
        ServletInitializer initializer = new ServletInitializer();
        SpringApplicationBuilder builder = initializer.configure(new SpringApplicationBuilder());

        assertNotNull(builder, "SpringApplicationBuilder should not be null");
    }
}
