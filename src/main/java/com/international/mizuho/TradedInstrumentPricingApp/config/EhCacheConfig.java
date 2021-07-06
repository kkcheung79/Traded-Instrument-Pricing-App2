package com.international.mizuho.TradedInstrumentPricingApp.config;

import org.ehcache.config.builders.CacheConfigurationBuilder;
import org.ehcache.config.builders.ExpiryPolicyBuilder;
import org.ehcache.config.builders.ResourcePoolsBuilder;
import org.ehcache.jsr107.Eh107Configuration;
import org.springframework.boot.autoconfigure.cache.JCacheManagerCustomizer;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.HashSet;

import static java.time.temporal.ChronoUnit.DAYS;

@Configuration
@EnableCaching
@EnableConfigurationProperties(PricingAppProperties.class)
public class EhCacheConfig {

    @Bean
    public JCacheManagerCustomizer customEhCacheConfig(PricingAppProperties properties) {
        javax.cache.configuration.Configuration<Object, HashSet> cacheConfig = Eh107Configuration
                .fromEhcacheCacheConfiguration(CacheConfigurationBuilder
                        .newCacheConfigurationBuilder(Object.class, HashSet.class, ResourcePoolsBuilder.heap(properties.getCacheMaxCapacity()))
                        .withExpiry(ExpiryPolicyBuilder.timeToLiveExpiration(Duration.of(properties.getCacheTtlDay(), DAYS)))
                        .build());
        return config -> {
            config.createCache(properties.getCacheNameVendor(), cacheConfig);
            config.createCache(properties.getCacheNameInstrument(), cacheConfig);
        };
    }

}
