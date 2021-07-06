package com.international.mizuho.TradedInstrumentPricingApp.model;

import java.io.Serializable;

/**
 * Interface for all domain model classes. It requires the subclasses must complete the hashCode() and equals() methods
 * Always make your custom key immutable to avoid memory leak
 *
 * @author Ken Cheung
 * @version 1.0
 * @since 2021-07-03
 */
public interface EqualsAndHashable extends Serializable {
    int hashCode();
}