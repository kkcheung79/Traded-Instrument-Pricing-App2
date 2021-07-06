package com.international.mizuho.TradedInstrumentPricingApp.service;

import com.international.mizuho.TradedInstrumentPricingApp.model.VendorTradingInstrumentPrice;

import java.util.Collection;

public interface TradedInstrumentPricingService {

    void saveOrUpdate(VendorTradingInstrumentPrice tradePrice);

    Collection<VendorTradingInstrumentPrice> getPricesByVendorId(Long vendorId);

    Collection<VendorTradingInstrumentPrice> getPricesByInstrumentCode(String instrumentCode);

    Collection<VendorTradingInstrumentPrice> fetch();
}
