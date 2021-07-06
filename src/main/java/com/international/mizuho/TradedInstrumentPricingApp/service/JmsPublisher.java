package com.international.mizuho.TradedInstrumentPricingApp.service;

import com.international.mizuho.TradedInstrumentPricingApp.model.VendorTradingInstrumentPrice;

public interface JmsPublisher {
    void publish(VendorTradingInstrumentPrice price);
}
