package com.foodordering.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MyOrderDto(Long id, LocalDateTime placedAt, BigDecimal total, OrderStatus status) {

    static MyOrderDto from(CustomerOrder order) {
        return new MyOrderDto(order.getId(), order.getPlacedAt(), order.getTotal(), order.getStatus());
    }
}