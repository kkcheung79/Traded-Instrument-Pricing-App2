package com.international.mizuho.TradedInstrumentPricingApp.util;

import com.international.mizuho.TradedInstrumentPricingApp.model.Instrument;
import com.international.mizuho.TradedInstrumentPricingApp.model.Vendor;
import com.international.mizuho.TradedInstrumentPricingApp.model.VendorTradingInstrumentPrice;
import com.international.mizuho.TradedInstrumentPricingApp.model.request.TradingInstrumentPricingRequest;
import org.springframework.stereotype.Component;

@Component
public class PricingModelMapperImpl implements PricingModelMapper {

    @Override
    public VendorTradingInstrumentPrice convert(TradingInstrumentPricingRequest from) {
        VendorTradingInstrumentPrice vendorTradingInstrumentPrice = new VendorTradingInstrumentPrice(
                from.getTxnDataTime(),
                new Vendor(from.getVendorId(), from.getVendorName()),
                new Instrument(from.getInstrumentId(), from.getInstrumentCode()),
                from.getBidPrice(),
                from.getAskPrice(),
                from.getCurrencyCode()
        );
        return vendorTradingInstrumentPrice;
    }
}
