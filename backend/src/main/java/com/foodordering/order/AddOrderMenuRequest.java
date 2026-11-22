package com.foodordering.order;

import jakarta.validation.constraints.NotNull;

// The dishes the customer chooses of today's menu (US-12). The drink is not chosen, it is included.
public record AddOrderMenuRequest(@NotNull Long starterId, @NotNull Long mainCourseId, @NotNull Long dessertId) {
}