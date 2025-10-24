package pt.isec.literaturereviewhelper;

import io.netty.channel.socket.nio.NioDatagramChannel;
import io.netty.resolver.dns.DnsAddressResolverGroup;
import io.netty.resolver.dns.DnsServerAddressStreamProviders;
import io.netty.resolver.dns.SingletonDnsServerAddressStreamProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import reactor.netty.http.client.HttpClient;

import java.net.InetSocketAddress;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient webClient() {
        // Create a Netty HttpClient with custom DNS resolver
        HttpClient httpClient = HttpClient.create()
                .resolver(new DnsAddressResolverGroup(
                        NioDatagramChannel.class,
                        new SingletonDnsServerAddressStreamProvider(
                                new InetSocketAddress("8.8.8.8", 53) // Google DNS
                        )
                ));

        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
    }
}
