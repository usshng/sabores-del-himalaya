package com.foodordering.order;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AddOrderItemRequest(@NotNull Long productId, @Positive int quantity) {
}