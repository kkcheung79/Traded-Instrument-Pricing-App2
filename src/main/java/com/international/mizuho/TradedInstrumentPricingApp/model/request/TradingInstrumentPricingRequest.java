package com.international.mizuho.TradedInstrumentPricingApp.model.request;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TradingInstrumentPricingRequest {
    // request submit Data time for problem tracking
    @NotNull
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    private LocalDateTime txnDataTime;
    // request UUID for problem tracking or propagating as corrID towards downstream
    @NotBlank
    private String uuid;
    @NotNull
    @Min(0)
    private Long vendorId;
    @NotBlank
    private String vendorName;
    @NotNull
    private Long instrumentId;
    @NotBlank
    private String instrumentCode;
    @NotBlank
    private String instrumentDescription;
    @NotNull
    private BigDecimal bidPrice;
    @NotNull
    private BigDecimal askPrice;
    // default: GBP
    private String currencyCode;


    public TradingInstrumentPricingRequest() {
    }

    public TradingInstrumentPricingRequest(Long vendorId, String vendorName, Long instrumentId, String instrumentCode, String instrumentDescription, BigDecimal bidPrice, BigDecimal askPrice, String currencyCode, LocalDateTime txnDataTime, String uuid) {
        this.vendorId = vendorId;
        this.vendorName = vendorName;
        this.instrumentId = instrumentId;
        this.instrumentCode = instrumentCode;
        this.instrumentDescription = instrumentDescription;
        this.bidPrice = bidPrice;
        this.askPrice = askPrice;
        this.currencyCode = currencyCode;
        this.txnDataTime = txnDataTime;
        this.uuid = uuid;
    }

    public long getVendorId() {
        return vendorId;
    }

    public void setVendorId(Long vendorId) {
        this.vendorId = vendorId;
    }

    public String getVendorName() {
        return vendorName;
    }

    public void setVendorName(String vendorName) {
        this.vendorName = vendorName;
    }

    public long getInstrumentId() {
        return instrumentId;
    }

    public void setInstrumentId(Long instrumentId) {
        this.instrumentId = instrumentId;
    }

    public String getInstrumentCode() {
        return instrumentCode;
    }

    public void setInstrumentCode(String instrumentCode) {
        this.instrumentCode = instrumentCode;
    }

    public String getInstrumentDescription() {
        return instrumentDescription;
    }

    public void setInstrumentDescription(String instrumentDescription) {
        this.instrumentDescription = instrumentDescription;
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

    public LocalDateTime getTxnDataTime() {
        return txnDataTime;
    }

    public void setTxnDataTime(LocalDateTime txnDataTime) {
        this.txnDataTime = txnDataTime;
    }

    public String getUuid() {
        return uuid;
    }

    public void setUuid(String uuid) {
        this.uuid = uuid;
    }

    @Override
    public String toString() {
        return "TradingInstrumentPricingRequest{" +
                "vendorId=" + vendorId +
                ", vendorName='" + vendorName + '\'' +
                ", instrumentId=" + instrumentId +
                ", instrumentCode='" + instrumentCode + '\'' +
                ", instrumentDescription='" + instrumentDescription + '\'' +
                ", bidPrice=" + bidPrice +
                ", askPrice=" + askPrice +
                ", currencyCode='" + currencyCode + '\'' +
                ", txnDataTime=" + txnDataTime +
                ", uuid='" + uuid + '\'' +
                '}';
    }
}
