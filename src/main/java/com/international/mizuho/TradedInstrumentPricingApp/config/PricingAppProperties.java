package com.international.mizuho.TradedInstrumentPricingApp.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "pricing.app", ignoreUnknownFields = false)
public class PricingAppProperties {
    // Cache properties
    private int cacheTtlDay;     //pricing.app.cache-ttl-day=30
    private int cacheMaxCapacity; //pricing.app.cache-max-capacity=9999
    private String cacheNameVendor;
    private String cacheNameInstrument;

    // JMS properties
    private String pricingTopic;    //pub/sub topic for traded instrument pricing info

    public void setCacheTtlDay(int cacheTtlDay) {
        this.cacheTtlDay = cacheTtlDay;
    }

    public void setCacheMaxCapacity(int cacheMaxCapacity) {
        this.cacheMaxCapacity = cacheMaxCapacity;
    }

    public int getCacheTtlDay() {
        return cacheTtlDay;
    }

    public int getCacheMaxCapacity() {
        return cacheMaxCapacity;
    }

    public String getCacheNameVendor() {
        return cacheNameVendor;
    }

    public void setCacheNameVendor(String cacheNameVendor) {
        this.cacheNameVendor = cacheNameVendor;
    }

    public String getCacheNameInstrument() {
        return cacheNameInstrument;
    }

    public void setCacheNameInstrument(String cacheNameInstrument) {
        this.cacheNameInstrument = cacheNameInstrument;
    }

    public String getPricingTopic() {
        return pricingTopic;
    }

    public void setPricingTopic(String pricingTopic) {
        this.pricingTopic = pricingTopic;
    }
}
