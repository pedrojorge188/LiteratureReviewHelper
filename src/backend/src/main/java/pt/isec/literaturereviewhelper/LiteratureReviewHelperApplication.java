package pt.isec.literaturereviewhelper;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class LiteratureReviewHelperApplication {

    public static void main(String[] args) {
        // Disable native transport (Epoll/KQueue) and force NIO
        System.setProperty("reactor.netty.native", "false");
        
        SpringApplication.run(LiteratureReviewHelperApplication.class, args);
    }
}
