package com.foodordering.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PlacedOrderDto(Long id, OrderStatus status, LocalDateTime placedAt, BigDecimal total,
        List<OrderItemDto> items) {

    static PlacedOrderDto from(CustomerOrder order) {
        return new PlacedOrderDto(order.getId(), order.getStatus(), order.getPlacedAt(), order.getTotal(),
                order.getItems().stream().map(OrderItemDto::from).toList());
    }
}