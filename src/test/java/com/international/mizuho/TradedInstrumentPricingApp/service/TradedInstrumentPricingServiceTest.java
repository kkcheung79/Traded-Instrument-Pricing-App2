package com.international.mizuho.TradedInstrumentPricingApp.service;

import com.international.mizuho.TradedInstrumentPricingApp.TradedInstrumentPricingAppApplication;
import com.international.mizuho.TradedInstrumentPricingApp.mockdata.MockDataUtil;
import com.international.mizuho.TradedInstrumentPricingApp.model.VendorTradingInstrumentPrice;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.CacheManager;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.test.annotation.DirtiesContext;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = TradedInstrumentPricingAppApplication.class)
@DirtiesContext
class TradedInstrumentPricingServiceTest {

    @Autowired
    private JmsPublisher jmsPublisher;

    @Autowired
    private JmsTemplate jmsTemplate;

    @Autowired
    private CacheManager cacheManager;

    @Autowired
    private TradedInstrumentPricingService tradedInstrumentPricingService;

    // clear the cache after each test to avoid incorrect test result
    @AfterEach
    public void clearCache() {
        cacheManager.getCacheNames().stream()
                .forEach(cacheName -> cacheManager.getCache(cacheName).clear());
    }

    @Test
    void testVendorAndInstrumentCacheWorking() {
        MockDataUtil.fetchPrices().forEach(
                tradedInstrumentPrice -> tradedInstrumentPricingService.saveOrUpdate(tradedInstrumentPrice));
        assertNotNull(cacheManager.getCache("VENDOR_CACHE").get(MockDataUtil.VENDOR_ID_AAA).get());
        assertNotNull(cacheManager.getCache("VENDOR_CACHE").get(MockDataUtil.VENDOR_ID_BBB).get());
        assertNotNull(cacheManager.getCache("INSTRUMENT_CACHE").get(MockDataUtil.INSTRUMENT_CODE_JPMC).get());
        assertNotNull(cacheManager.getCache("INSTRUMENT_CACHE").get(MockDataUtil.INSTRUMENT_CODE_UKEX).get());
    }

    @Test
    void getPricesByNotExistingVendorId() {
        MockDataUtil.fetchPrices().forEach(
                tradedInstrumentPrice -> tradedInstrumentPricingService.saveOrUpdate(tradedInstrumentPrice));
        assertTrue(tradedInstrumentPricingService.getPricesByVendorId(9999l).isEmpty());
    }

    @Test
    void getPricesByVendorId() {
        MockDataUtil.fetchPrices().forEach(
                tradedInstrumentPrice -> tradedInstrumentPricingService.saveOrUpdate(tradedInstrumentPrice));
        assertEquals(4, tradedInstrumentPricingService.getPricesByVendorId(MockDataUtil.VENDOR_ID_AAA).size());
        assertEquals(3, tradedInstrumentPricingService.getPricesByVendorId(MockDataUtil.VENDOR_ID_BBB).size());
    }

    @Test
    void getPricesByInstrumentCode() {
        tradedInstrumentPricingService.saveOrUpdate(MockDataUtil.vendorB_Pricing3);
        assertEquals(1, tradedInstrumentPricingService.getPricesByInstrumentCode(MockDataUtil.INSTRUMENT_CODE_JPMC).size());
    }

    @Test
    void getPricesByNotExistingInstrumentCode() {
        tradedInstrumentPricingService.saveOrUpdate(MockDataUtil.vendorB_Pricing3);
        assertTrue(tradedInstrumentPricingService.getPricesByInstrumentCode(MockDataUtil.INSTRUMENT_CODE_HKEX).isEmpty());
    }

    @Test
    void pubToSubTopic() {
        jmsPublisher.publish(MockDataUtil.vendorA_Pricing4);
        jmsTemplate.setReceiveTimeout(9999);
        int size =
                jmsTemplate.browse("TRADING_INSTRUMENT_PRICING_TOPIC",
                        (session, browser) -> Collections.list(browser.getEnumeration()).size());
        VendorTradingInstrumentPrice tradedInstrumentPrice =
                (VendorTradingInstrumentPrice) jmsTemplate
                        .receiveAndConvert("TRADING_INSTRUMENT_PRICING_TOPIC");
        assertTrue(size >= 1);
    }
}
