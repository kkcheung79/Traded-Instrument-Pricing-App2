package com.international.mizuho.TradedInstrumentPricingApp.service;

import com.international.mizuho.TradedInstrumentPricingApp.config.PricingAppProperties;
import com.international.mizuho.TradedInstrumentPricingApp.datacache.InMemoryDataCache;
import com.international.mizuho.TradedInstrumentPricingApp.model.Instrument;
import com.international.mizuho.TradedInstrumentPricingApp.model.Vendor;
import com.international.mizuho.TradedInstrumentPricingApp.model.VendorTradingInstrumentPrice;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.stream.Collectors;

/**
 * TradedInstrumentPricingServiceImpl provides reading and writing traded instrument pricing to cache and data store
 * and publishing pricing to TRADING_INSTRUMENT_PRICING_TOPIC topic for downstream subscribers
 *
 * @author Ken Cheung
 * @version 1.0
 * @since 2021-07-05
 */
@Service
@Transactional
@EnableConfigurationProperties(PricingAppProperties.class)
public class TradedInstrumentPricingServiceImpl implements TradedInstrumentPricingService {

    private JmsPublisher jmsPublisher;

    private CacheManager cacheManager;

    @Autowired
    private PricingAppProperties properties;

    private InMemoryDataCache<String, VendorTradingInstrumentPrice> inMemoryDataStore;

    public TradedInstrumentPricingServiceImpl(JmsPublisher jmsPublisher, CacheManager cacheManager, PricingAppProperties properties, InMemoryDataCache<String, VendorTradingInstrumentPrice> inMemoryDataStore) {
        this.jmsPublisher = jmsPublisher;
        this.cacheManager = cacheManager;
        this.properties = properties;
        this.inMemoryDataStore = inMemoryDataStore;
    }

    @Override
    public void saveOrUpdate(VendorTradingInstrumentPrice tradingInstrumentPrice) {
        // update vendor cache
        updateVendorCache(tradingInstrumentPrice);
        // update instrument cache
        updateInstrumentCache(tradingInstrumentPrice);
        // insert or update the traded instrument price
        inMemoryDataStore.insertOrUpdate(tradingInstrumentPrice.getKey(), tradingInstrumentPrice);
        // publish to downstream subscriber pricing topic
        jmsPublisher.publish(tradingInstrumentPrice);
    }

    private void updateInstrumentCache(VendorTradingInstrumentPrice tradingInstrumentPrice) {
        Instrument instrument = tradingInstrumentPrice.getInstrument();
        if (instrument == null) {
            throw new IllegalArgumentException("::instrument cannot be null");
        }
        String instrumentCode = instrument.getInstrumentCode();
        if (instrumentCode == null) {
            throw new IllegalArgumentException("::instrumentCode cannot be null");
        }
        Cache cache = cacheManager.getCache(properties.getCacheNameInstrument());
        Cache.ValueWrapper instrumentCache = cache.get(instrumentCode);
        HashSet<VendorTradingInstrumentPrice> set;
        if (instrumentCache != null) {
            set = ((HashSet<VendorTradingInstrumentPrice>) instrumentCache.get());
            set.add(tradingInstrumentPrice);
        } else {
            set = new HashSet<>(Arrays.asList(tradingInstrumentPrice));
        }
        cache.put(instrumentCode, set);
    }

    private void updateVendorCache(VendorTradingInstrumentPrice tradingInstrumentPrice) {
        Vendor vendor = tradingInstrumentPrice.getVendor();
        if (vendor == null) {
            throw new IllegalArgumentException("::vendor cannot be null");
        }
        Long vendorId = vendor.getVendorId();
        if (vendorId == null) {
            throw new IllegalArgumentException("::vendorId cannot be null");
        }
        Cache cache = cacheManager.getCache(properties.getCacheNameVendor());
        Cache.ValueWrapper vendorCache = cache.get(vendorId);
        HashSet<VendorTradingInstrumentPrice> set;
        if (vendorCache != null) {
            set = ((HashSet<VendorTradingInstrumentPrice>) vendorCache.get());
            set.add(tradingInstrumentPrice);
        } else {
            set = new HashSet<>(Arrays.asList(tradingInstrumentPrice));
        }
        cache.put(vendorId, set);
    }

    @Override
    @Cacheable(cacheNames = "VENDOR_CACHE")
    public Collection<VendorTradingInstrumentPrice> getPricesByVendorId(Long vendorId) {
        Collection<VendorTradingInstrumentPrice> tradePriceListByInstrument
                = inMemoryDataStore.fetch()
                .stream()
                .filter(tradingInstrumentPrice
                        -> vendorId.equals(tradingInstrumentPrice.getVendor().getVendorId()))
                .collect(Collectors.toList());
        return new HashSet<>(tradePriceListByInstrument);
    }

    @Override
    @Cacheable(cacheNames = "INSTRUMENT_CACHE")
    public Collection<VendorTradingInstrumentPrice> getPricesByInstrumentCode(String instrumentCode) {
        Collection<VendorTradingInstrumentPrice> tradePriceListByInstrument
                = inMemoryDataStore.fetch()
                .stream()
                .filter(tradingInstrumentPrice
                        -> instrumentCode.equals(tradingInstrumentPrice.getInstrument().getInstrumentCode()))
                .collect(Collectors.toList());
        return new HashSet<>(tradePriceListByInstrument);
    }

    @Override
    public Collection<VendorTradingInstrumentPrice> fetch() {
        return inMemoryDataStore.fetch();
    }
}
