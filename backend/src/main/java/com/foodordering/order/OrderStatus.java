package com.foodordering.order;

public enum OrderStatus {
    // The customer is still composing the order; it is not sent to the restaurant until confirmed (US-14).
    IN_PROGRESS,
    RECEIVED,
    IN_PREPARATION,
    OUT_FOR_DELIVERY,
    DELIVERED,
    CANCELLED
}