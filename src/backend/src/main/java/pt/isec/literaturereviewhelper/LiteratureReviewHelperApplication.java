package pt.isec.literaturereviewhelper;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class LiteratureReviewHelperApplication {

    public static void main(String[] args) {
        System.setProperty("reactor.netty.native", "false");
        
        SpringApplication.run(LiteratureReviewHelperApplication.class, args);
    }
}
