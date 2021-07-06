package com.international.mizuho.TradedInstrumentPricingApp.model.response;

import java.time.LocalDateTime;

public class SuccessMessage<T> {
    private int statusCode;
    private LocalDateTime timestamp;
    private String message;
    private T body;

    public SuccessMessage(int statusCode, LocalDateTime timestamp, String message, T body) {
        this.statusCode = statusCode;
        this.timestamp = timestamp;
        this.message = message;
        this.body = body;
    }

    public int getStatusCode() {
        return statusCode;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public String getMessage() {
        return message;
    }

    public T getBody() {
        return body;
    }
}
