package com.international.mizuho.TradedInstrumentPricingApp.util;

import com.international.mizuho.TradedInstrumentPricingApp.model.VendorTradingInstrumentPrice;
import com.international.mizuho.TradedInstrumentPricingApp.model.request.TradingInstrumentPricingRequest;

public interface PricingModelMapper {
    VendorTradingInstrumentPrice convert(TradingInstrumentPricingRequest from);
}
