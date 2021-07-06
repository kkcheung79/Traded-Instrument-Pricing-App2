package com.international.mizuho.TradedInstrumentPricingApp.mockdata;

import com.international.mizuho.TradedInstrumentPricingApp.model.Instrument;
import com.international.mizuho.TradedInstrumentPricingApp.model.Vendor;
import com.international.mizuho.TradedInstrumentPricingApp.model.VendorTradingInstrumentPrice;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collection;
import java.util.Currency;
import java.util.HashSet;

public class MockDataUtil {

    public static LocalDateTime NOW = LocalDateTime.of(2021, 07, 04, 11, 42, 59);
    public static LocalDateTime FIVE_HOUR_AGO = NOW.minusHours(5l);
    public static LocalDateTime ONE_DAY_AGO = NOW.minusDays(1l);
    public static LocalDateTime THIRTY_DAY_AGO = NOW.minusDays(30l);
    public static LocalDateTime THIRTY_ONE_DAY_AGO = NOW.minusDays(31l);

    public static String VENDOR_NAME_AAA = "AAA";
    public static String VENDOR_NAME_BBB = "BBB";

    public static Long VENDOR_ID_AAA = 1l;
    public static Long VENDOR_ID_BBB = 2l;

    public static String INSTRUMENT_CODE_UKEX = "UKEX";
    public static String INSTRUMENT_CODE_JPMC = "JPMC";
    public static String INSTRUMENT_CODE_FACE = "FACE";
    public static String INSTRUMENT_CODE_HKEX = "HKEX";

    public static Long INSTRUMENT_ID_UKEX = 1001l;
    public static Long INSTRUMENT_ID_JPMC = 2001l;
    public static Long INSTRUMENT_ID_FACE = 3001l;
    public static Long INSTRUMENT_ID_HKEX = 4001l;

    public static String CONST_CURRENCY_CODE_GBP = Currency.getInstance("GBP").getCurrencyCode();

    public static VendorTradingInstrumentPrice vendorA_Pricing1 = new VendorTradingInstrumentPrice(
            NOW, new Vendor(VENDOR_ID_AAA, VENDOR_NAME_AAA),
            new Instrument(INSTRUMENT_ID_UKEX, INSTRUMENT_CODE_UKEX),
            new BigDecimal("101.22"), new BigDecimal("101.98"), CONST_CURRENCY_CODE_GBP);

    public static VendorTradingInstrumentPrice vendorA_Pricing2 = new VendorTradingInstrumentPrice(
            FIVE_HOUR_AGO, new Vendor(VENDOR_ID_AAA, VENDOR_NAME_AAA),
            new Instrument(INSTRUMENT_ID_UKEX, INSTRUMENT_CODE_UKEX),
            new BigDecimal("102.22"), new BigDecimal("103.33"), CONST_CURRENCY_CODE_GBP);

    public static VendorTradingInstrumentPrice vendorA_Pricing3 = new VendorTradingInstrumentPrice(
            THIRTY_DAY_AGO, new Vendor(VENDOR_ID_AAA, VENDOR_NAME_AAA),
            new Instrument(INSTRUMENT_ID_UKEX, INSTRUMENT_CODE_UKEX),
            new BigDecimal("102.22"), new BigDecimal("103.33"), CONST_CURRENCY_CODE_GBP);

    public static VendorTradingInstrumentPrice vendorA_Pricing4 = new VendorTradingInstrumentPrice(
            THIRTY_ONE_DAY_AGO, new Vendor(VENDOR_ID_AAA, VENDOR_NAME_AAA),
            new Instrument(INSTRUMENT_ID_JPMC, INSTRUMENT_CODE_JPMC),
            new BigDecimal("999.22"), new BigDecimal("1001.33"), CONST_CURRENCY_CODE_GBP);

    public static VendorTradingInstrumentPrice vendorB_Pricing1 = new VendorTradingInstrumentPrice(
            ONE_DAY_AGO, new Vendor(VENDOR_ID_BBB, VENDOR_NAME_BBB),
            new Instrument(INSTRUMENT_ID_UKEX, INSTRUMENT_CODE_UKEX),
            new BigDecimal("99.22"), new BigDecimal("101.98"), CONST_CURRENCY_CODE_GBP);

    public static VendorTradingInstrumentPrice vendorB_Pricing2 = new VendorTradingInstrumentPrice(
            FIVE_HOUR_AGO, new Vendor(VENDOR_ID_BBB, VENDOR_NAME_BBB),
            new Instrument(INSTRUMENT_ID_UKEX, INSTRUMENT_CODE_UKEX),
            new BigDecimal("99.22"), new BigDecimal("101.98"), CONST_CURRENCY_CODE_GBP);

    public static VendorTradingInstrumentPrice vendorB_Pricing3 = new VendorTradingInstrumentPrice(
            THIRTY_DAY_AGO, new Vendor(VENDOR_ID_BBB, VENDOR_NAME_BBB),
            new Instrument(INSTRUMENT_ID_JPMC, INSTRUMENT_CODE_JPMC),
            new BigDecimal("991.22"), new BigDecimal("1011.98"), CONST_CURRENCY_CODE_GBP);

    public static Collection<VendorTradingInstrumentPrice> fetchPrices() {
        return new HashSet<>(Arrays.asList(
                vendorA_Pricing1, vendorA_Pricing2, vendorA_Pricing3, vendorA_Pricing4,
                vendorB_Pricing1, vendorB_Pricing2, vendorB_Pricing3
        ));
    }

    public static Collection<VendorTradingInstrumentPrice> getPriceByInstrumentCodeJPMC() {
        return new HashSet<>(Arrays.asList(
                vendorA_Pricing1, vendorA_Pricing2, vendorA_Pricing3,
                vendorB_Pricing1, vendorB_Pricing2
        ));
    }

    public static Collection<VendorTradingInstrumentPrice> getPriceByVendorIdAAA() {
        return new HashSet<>(Arrays.asList(
                vendorA_Pricing1, vendorA_Pricing2, vendorA_Pricing3
        ));
    }
}
