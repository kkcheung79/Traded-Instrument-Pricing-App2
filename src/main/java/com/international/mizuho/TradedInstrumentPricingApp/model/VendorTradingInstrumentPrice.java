package com.international.mizuho.TradedInstrumentPricingApp.model;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;

public class VendorTradingInstrumentPrice implements EqualsAndHashable {
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    private LocalDateTime txnDataTime;
    private Vendor vendor;
    private Instrument instrument;
    private BigDecimal bidPrice;
    private BigDecimal askPrice;

    private String currencyCode;

    public String getKey() {
        return String.join("_", String.valueOf(vendor.getVendorId()), instrument.getInstrumentCode(), txnDataTime.toString());
    }

    public VendorTradingInstrumentPrice(LocalDateTime txnDataTime, Vendor vendor, Instrument instrument, BigDecimal bidPrice, BigDecimal askPrice, String currencyCode) {
        this.txnDataTime = txnDataTime;
        this.vendor = vendor;
        this.instrument = instrument;
        this.bidPrice = bidPrice;
        this.askPrice = askPrice;
        this.currencyCode = currencyCode;
    }

    public VendorTradingInstrumentPrice() {
    }

    public LocalDateTime getTxnDataTime() {
        return txnDataTime;
    }

    public void setTxnDataTime(LocalDateTime txnDataTime) {
        this.txnDataTime = txnDataTime;
    }

    public Vendor getVendor() {
        return vendor;
    }

    public void setVendor(Vendor vendor) {
        this.vendor = vendor;
    }

    public Instrument getInstrument() {
        return instrument;
    }

    public void setInstrument(Instrument instrument) {
        this.instrument = instrument;
    }

    public BigDecimal getBidPrice() {
        return bidPrice;
    }

    public void setBidPrice(BigDecimal bidPrice) {
        this.bidPrice = bidPrice;
    }

    public BigDecimal getAskPrice() {
        return askPrice;
    }

    public void setAskPrice(BigDecimal askPrice) {
        this.askPrice = askPrice;
    }

    public String getCurrencyCode() {
        return currencyCode;
    }

    public void setCurrencyCode(String currencyCode) {
        this.currencyCode = currencyCode;
    }

    @Override
    public boolean equals(Object model) {
        if (this == model) {
            return true;
        }
        if (!(model instanceof VendorTradingInstrumentPrice)) {
            return false;
        }
        VendorTradingInstrumentPrice that = (VendorTradingInstrumentPrice) model;
        return Objects.equals(vendor, that.vendor) &&
                Objects.equals(instrument, that.instrument) &&
                Objects.equals(txnDataTime, that.txnDataTime);
    }

    @Override
    public int hashCode() {
        return Objects.hash(vendor, instrument, txnDataTime);
    }

    @Override
    public String toString() {
        return "VendorTradingInstrumentPrice{" +
                "txnDataTime=" + txnDataTime +
                ", vendor=" + vendor +
                ", instrument=" + instrument +
                ", bidPrice=" + bidPrice +
                ", askPrice=" + askPrice +
                ", currencyCode='" + currencyCode + '\'' +
                '}';
    }
}
