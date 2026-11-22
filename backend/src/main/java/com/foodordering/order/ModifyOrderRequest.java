package com.foodordering.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

// The new content of a placed order (US-15): the products with their quantities, the menus the customer
// keeps and the new menus. A product or menu that is not in the request is removed from the order.
public record ModifyOrderRequest(@NotNull List<@Valid OrderLineRequest> items, @NotNull List<Long> keptMenuIds,
        @NotNull List<@Valid AddOrderMenuRequest> newMenus) {
}