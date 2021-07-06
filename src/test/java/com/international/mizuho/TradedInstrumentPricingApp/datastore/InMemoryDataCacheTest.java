package com.international.mizuho.TradedInstrumentPricingApp.datastore;

import com.international.mizuho.TradedInstrumentPricingApp.datacache.InMemoryDataCache;
import com.international.mizuho.TradedInstrumentPricingApp.datacache.InMemoryDataCacheImpl;
import com.international.mizuho.TradedInstrumentPricingApp.mockdata.MockDataUtil;
import com.international.mizuho.TradedInstrumentPricingApp.model.VendorTradingInstrumentPrice;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Collection;

import static org.junit.jupiter.api.Assertions.assertEquals;

class InMemoryDataCacheTest {

    private InMemoryDataCache<String, VendorTradingInstrumentPrice> inMemoryDataCache;

    @BeforeEach
    public void createNewDataStore() {
        inMemoryDataCache = new InMemoryDataCacheImpl<>();
    }

    @Test
    void saveAllAndFetch() {
        MockDataUtil.fetchPrices().forEach(
                tradedInstrumentPrice
                        -> inMemoryDataCache
                        .insertOrUpdate(tradedInstrumentPrice.getKey(), tradedInstrumentPrice));
        Collection<VendorTradingInstrumentPrice> prices = inMemoryDataCache.fetch();
        assertEquals(MockDataUtil.fetchPrices().size(), prices.size());
    }

    @Test
    void saveAllAndFetchAndDuplicateOne() {
        MockDataUtil.fetchPrices().forEach(
                tradedInstrumentPrice
                        -> inMemoryDataCache
                        .insertOrUpdate(tradedInstrumentPrice.getKey(), tradedInstrumentPrice));
        Collection<VendorTradingInstrumentPrice> prices = inMemoryDataCache.fetch();
        inMemoryDataCache.insertOrUpdate(MockDataUtil.vendorA_Pricing1.getKey(), MockDataUtil.vendorA_Pricing1);
        assertEquals(MockDataUtil.fetchPrices().size(), prices.size());
    }

    @Test
    void getOne() {
        MockDataUtil.fetchPrices().forEach(
                tradedInstrumentPrice
                        -> inMemoryDataCache
                        .insertOrUpdate(tradedInstrumentPrice.getKey(), tradedInstrumentPrice));
        Collection<VendorTradingInstrumentPrice> prices = inMemoryDataCache.fetch();
        VendorTradingInstrumentPrice price = inMemoryDataCache.get(MockDataUtil.vendorA_Pricing1.getKey());
        assertEquals(MockDataUtil.vendorA_Pricing1, price);
    }

    @Test
    void deleteOne() {
        MockDataUtil.fetchPrices().forEach(
                tradedInstrumentPrice
                        -> inMemoryDataCache
                        .insertOrUpdate(tradedInstrumentPrice.getKey(), tradedInstrumentPrice));
        Collection<VendorTradingInstrumentPrice> prices = inMemoryDataCache.fetch();
        inMemoryDataCache.delete(MockDataUtil.vendorA_Pricing1.getKey());
        assertEquals(MockDataUtil.fetchPrices().size() - 1, inMemoryDataCache.fetch().size());
    }
}
