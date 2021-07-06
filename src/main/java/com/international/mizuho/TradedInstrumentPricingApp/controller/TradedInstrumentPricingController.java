package com.international.mizuho.TradedInstrumentPricingApp.controller;

import com.international.mizuho.TradedInstrumentPricingApp.model.VendorTradingInstrumentPrice;
import com.international.mizuho.TradedInstrumentPricingApp.model.request.TradingInstrumentPricingRequest;
import com.international.mizuho.TradedInstrumentPricingApp.model.response.SuccessMessage;
import com.international.mizuho.TradedInstrumentPricingApp.service.TradedInstrumentPricingService;
import com.international.mizuho.TradedInstrumentPricingApp.util.PricingModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.Collection;

@RestController
@RequestMapping("/api")
public class TradedInstrumentPricingController {

    private final TradedInstrumentPricingService pricingService;

    private final PricingModelMapper pricingModelMapper;

    public TradedInstrumentPricingController(TradedInstrumentPricingService pricingService, PricingModelMapper pricingModelMapper) {
        this.pricingService = pricingService;
        this.pricingModelMapper = pricingModelMapper;
    }

    @PostMapping(value = "/price", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<SuccessMessage<String>> producePrice(@Valid @RequestBody TradingInstrumentPricingRequest request) {
        VendorTradingInstrumentPrice vendorTradingInstrumentPrice = pricingModelMapper.convert(request);
        pricingService.saveOrUpdate(vendorTradingInstrumentPrice);
        return ResponseEntity.ok().body(
                new SuccessMessage<String>(HttpStatus.OK.value(),
                        LocalDateTime.now(), "Operation approved", "Traded Instrument Price has been created."));
    }

    @GetMapping(value = "/prices/instrument/{instrumentCode}")
    public ResponseEntity<SuccessMessage<Collection<VendorTradingInstrumentPrice>>> getInstrumentPricesByInstrumentCode(@PathVariable String instrumentCode) {
        Collection<VendorTradingInstrumentPrice> prices = pricingService.getPricesByInstrumentCode(instrumentCode);
        return ResponseEntity.ok().body(
                new SuccessMessage<Collection<VendorTradingInstrumentPrice>>(HttpStatus.OK.value(),
                        LocalDateTime.now(), "Operation approved.", prices));
    }

    @GetMapping(value = "/prices/vendor/{vendorId}")
    public ResponseEntity<SuccessMessage<Collection<VendorTradingInstrumentPrice>>> getInstrumentPricesByVendorId(@PathVariable Long vendorId) {
        Collection<VendorTradingInstrumentPrice> prices = pricingService.getPricesByVendorId(vendorId);
        return ResponseEntity.ok().body(
                new SuccessMessage<Collection<VendorTradingInstrumentPrice>>(HttpStatus.OK.value(),
                        LocalDateTime.now(), "Operation approved.", prices));
    }
}
