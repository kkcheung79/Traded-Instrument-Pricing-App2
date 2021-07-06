package com.international.mizuho.TradedInstrumentPricingApp.model;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.Objects;

public class Instrument implements EqualsAndHashable {

    @NotNull
    private Long instrumentId;
    @NotBlank
    private String instrumentCode;

    public Instrument(Long instrumentId, String instrumentCode) {
        this.instrumentId = instrumentId;
        this.instrumentCode = instrumentCode;
    }

    public Instrument() {
    }

    public Long getInstrumentId() {
        return instrumentId;
    }

    public String getInstrumentCode() {
        return instrumentCode;
    }

    @Override
    public String toString() {
        return "Instrument{" +
                "instrumentId=" + instrumentId +
                ", instrumentCode='" + instrumentCode + '\'' +
                '}';
    }

    @Override
    public boolean equals(Object model) {
        if (this == model) {
            return true;
        }
        if (!(model instanceof Instrument)) {
            return false;
        }
        Instrument that = (Instrument) model;
        return Objects.equals(instrumentId, that.instrumentId) &&
                Objects.equals(instrumentCode, that.instrumentCode);
    }

    @Override
    public int hashCode() {
        return Objects.hash(instrumentId, instrumentCode);
    }
}
