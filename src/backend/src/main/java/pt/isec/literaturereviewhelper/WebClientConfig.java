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
        // Create a Netty HttpClient with custom DNS resolver
        String dnsServer = environment.getProperty("custom.dns.server");
        int dnsPort = Integer.parseInt(Objects.requireNonNull(environment.getProperty("custom.dns.port")));
        assert dnsServer != null;
        HttpClient httpClient = HttpClient.create()
                .resolver(new DnsAddressResolverGroup(
                        NioDatagramChannel.class,
                        new SingletonDnsServerAddressStreamProvider(
                                new InetSocketAddress(dnsServer, dnsPort) // Google DNS
                        )
                ));

        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }
}
