package pt.isec.literaturereviewhelper.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
public class TestController {
    /** Example controller to check execution Status of Backend. */
    @GetMapping("/test")
    public Map<String, String> health() {
        return Map.of("status", "UP");
    }
}
