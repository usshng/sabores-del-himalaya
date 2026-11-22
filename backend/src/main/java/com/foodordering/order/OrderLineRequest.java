package com.foodordering.order;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

// A product of the modified order with its new quantity (US-15).
public record OrderLineRequest(@NotNull Long productId, @Positive int quantity) {
}