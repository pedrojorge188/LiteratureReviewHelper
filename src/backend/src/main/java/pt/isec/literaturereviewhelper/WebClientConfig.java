package pt.isec.literaturereviewhelper;

import io.netty.channel.ChannelOption;
import io.netty.channel.socket.nio.NioDatagramChannel;
import io.netty.resolver.dns.DnsAddressResolverGroup;
import io.netty.resolver.dns.DnsNameResolverBuilder;
import io.netty.resolver.dns.SingletonDnsServerAddressStreamProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.net.InetSocketAddress;
import java.util.Objects;


@Configuration
public class WebClientConfig {
    private final Environment environment;

    public WebClientConfig(Environment environment) {
        this.environment = environment;
    }

    @Bean
    public WebClient webClient() {
        String dnsServer = environment.getProperty("custom.dns.server");
        int dnsPort = Integer.parseInt(Objects.requireNonNull(environment.getProperty("custom.dns.port")));
        
        // Build DNS resolver with NIO transport
        DnsAddressResolverGroup resolverGroup = new DnsAddressResolverGroup(
            new DnsNameResolverBuilder()
                .channelType(NioDatagramChannel.class)
                .nameServerProvider(new SingletonDnsServerAddressStreamProvider(
                    new InetSocketAddress(dnsServer, dnsPort)
                ))
        );

        // Create HttpClient with custom DNS resolver
        HttpClient httpClient = HttpClient.create()
            .resolver(resolverGroup)
            .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 30000);

        return WebClient.builder()
            .clientConnector(new ReactorClientHttpConnector(httpClient))
            .build();
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:5173") // domínio do front
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
