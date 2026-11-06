package com.foodordering.order;

import java.math.BigDecimal;

public record OrderItemDto(Long productId, String name, BigDecimal unitPrice, int quantity) {

    static OrderItemDto from(OrderItem item) {
        return new OrderItemDto(item.getProduct().getId(), item.getProduct().getName(), item.getUnitPrice(),
                item.getQuantity());
    }
}