package pt.isec.literaturereviewhelper;

import io.netty.channel.ChannelOption;
import io.netty.channel.socket.nio.NioDatagramChannel;
import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslContextBuilder;
import io.netty.handler.ssl.util.InsecureTrustManagerFactory;
import io.netty.resolver.dns.DnsAddressResolverGroup;
import io.netty.resolver.dns.DnsNameResolverBuilder;
import io.netty.resolver.dns.SingletonDnsServerAddressStreamProvider;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.http.codec.json.Jackson2JsonDecoder;
import org.springframework.http.codec.json.Jackson2JsonEncoder;
import org.springframework.http.codec.xml.Jaxb2XmlDecoder;
import org.springframework.http.codec.xml.Jaxb2XmlEncoder;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.net.InetSocketAddress;
import java.util.Objects;

import javax.net.ssl.SSLException;

@Configuration
public class WebClientConfig {
    private final Environment environment;

    public WebClientConfig(Environment environment) {
        this.environment = environment;
    }

    @Bean
    public WebClient webClient() throws SSLException {
        String dnsServer = environment.getProperty("custom.dns.server");
        int dnsPort = Integer.parseInt(Objects.requireNonNull(environment.getProperty("custom.dns.port")));
        
        // Build SSL context that trusts all certificates
        SslContext sslContext = SslContextBuilder
            .forClient()
            .trustManager(InsecureTrustManagerFactory.INSTANCE)
            .build();
        
        // Build DNS resolver with NIO transport
        DnsAddressResolverGroup resolverGroup = new DnsAddressResolverGroup(
            new DnsNameResolverBuilder()
                .channelType(NioDatagramChannel.class)
                .nameServerProvider(new SingletonDnsServerAddressStreamProvider(
                    new InetSocketAddress(dnsServer, dnsPort)
                ))
        );

        // JSON mapper for most engines
        ObjectMapper jsonMapper = new ObjectMapper();
        jsonMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(configurer -> {
                    configurer.defaultCodecs().maxInMemorySize(16 * 1024 * 1024); // 16MB

                    // JSON codecs for other engines
                    configurer.defaultCodecs().jackson2JsonDecoder(
                            new Jackson2JsonDecoder(jsonMapper, MediaType.APPLICATION_JSON)
                    );
                    configurer.defaultCodecs().jackson2JsonEncoder(
                            new Jackson2JsonEncoder(jsonMapper, MediaType.APPLICATION_JSON)
                    );

                    // XML codecs specifically for ArXiv
                    configurer.defaultCodecs().jaxb2Decoder(new Jaxb2XmlDecoder());
                    configurer.defaultCodecs().jaxb2Encoder(new Jaxb2XmlEncoder());
                })
                .build();

        // Create HttpClient with custom DNS resolver and SSL context
        HttpClient httpClient = HttpClient.create()
            .resolver(resolverGroup)
            .secure(t -> t.sslContext(sslContext))
            .option(ChannelOption.CONNECT_TIMEOUT_MILLIS, 30000);

        WebClient client = WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .exchangeStrategies(strategies)
                .build();

        return client;
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
