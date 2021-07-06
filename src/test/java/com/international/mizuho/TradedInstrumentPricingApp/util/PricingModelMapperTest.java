package com.international.mizuho.TradedInstrumentPricingApp.util;

import com.international.mizuho.TradedInstrumentPricingApp.mockdata.MockDataUtil;
import com.international.mizuho.TradedInstrumentPricingApp.model.VendorTradingInstrumentPrice;
import com.international.mizuho.TradedInstrumentPricingApp.model.request.TradingInstrumentPricingRequest;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.UUID;

class PricingModelMapperTest {

    private PricingModelMapper pricingModelMapper = new PricingModelMapperImpl();

    @Test
    void convertReqToVendorTradingInstrumentPrice() {
        TradingInstrumentPricingRequest req = new TradingInstrumentPricingRequest(
                MockDataUtil.VENDOR_ID_AAA,
                "VENDOR_A",
                MockDataUtil.INSTRUMENT_ID_UKEX,
                MockDataUtil.INSTRUMENT_CODE_UKEX,
                "This is the description of UKEX",
                new BigDecimal("101.22"),
                new BigDecimal("101.98"),
                MockDataUtil.CONST_CURRENCY_CODE_GBP,
                MockDataUtil.NOW,
                UUID.randomUUID().toString()
        );
        VendorTradingInstrumentPrice price = pricingModelMapper.convert(req);
        Assertions.assertEquals(price.getVendor().getVendorId(), MockDataUtil.VENDOR_ID_AAA);
        Assertions.assertEquals(price.getInstrument().getInstrumentCode(), MockDataUtil.INSTRUMENT_CODE_UKEX);
        Assertions.assertEquals(price.getInstrument().getInstrumentId(), MockDataUtil.INSTRUMENT_ID_UKEX);
    }
}
