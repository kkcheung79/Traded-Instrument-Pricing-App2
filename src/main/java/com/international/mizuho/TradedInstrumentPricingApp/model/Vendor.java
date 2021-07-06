package com.international.mizuho.TradedInstrumentPricingApp.model;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.Objects;

public class Vendor implements EqualsAndHashable {

    @NotNull
    private Long vendorId;
    @NotBlank
    private String vendorName;

    public Vendor(Long vendorId, String vendorName) {
        this.vendorId = vendorId;
        this.vendorName = vendorName;
    }

    public Vendor() {
    }

    public Long getVendorId() {
        return vendorId;
    }

    @Override
    public String toString() {
        return "Vendor{" +
                "vendorId=" + vendorId +
                ", vendorName='" + vendorName + '\'' +
                '}';
    }

    public String getVendorName() {
        return vendorName;
    }

    @Override
    public boolean equals(Object model) {
        if (this == model) {
            return true;
        }
        if (!(model instanceof Vendor)) {
            return false;
        }
        Vendor that = (Vendor) model;
        return Objects.equals(vendorId, that.vendorId) &&
                Objects.equals(vendorName, that.vendorName);
    }

    @Override
    public int hashCode() {
        return Objects.hash(vendorId, vendorName);
    }
}
