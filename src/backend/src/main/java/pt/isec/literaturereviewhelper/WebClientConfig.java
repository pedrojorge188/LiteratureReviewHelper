package pt.isec.literaturereviewhelper;

import io.netty.channel.socket.nio.NioDatagramChannel;
import io.netty.resolver.dns.DnsAddressResolverGroup;
import org.springframework.core.env.Environment;
import io.netty.resolver.dns.SingletonDnsServerAddressStreamProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import reactor.netty.http.client.HttpClient;
import reactor.netty.resources.LoopResources;

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
        // Create a Netty HttpClient with custom DNS resolver and NIO event loop
        String dnsServer = environment.getProperty("custom.dns.server");
        int dnsPort = Integer.parseInt(Objects.requireNonNull(environment.getProperty("custom.dns.port")));
        
        // Force NIO event loop to match NioDatagramChannel
        LoopResources loopResources = LoopResources.create("webflux-http", 1, true);
        
        HttpClient httpClient = HttpClient.create()
                .runOn(loopResources)
                .resolver(new DnsAddressResolverGroup(
                        NioDatagramChannel.class,
                        new SingletonDnsServerAddressStreamProvider(
                                new InetSocketAddress(dnsServer, dnsPort)
                        )
                ));

        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }
}
