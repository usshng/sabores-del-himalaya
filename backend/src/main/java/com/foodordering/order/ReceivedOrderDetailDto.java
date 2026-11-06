package com.foodordering.order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ReceivedOrderDetailDto(Long id, String customerName, String customerAddress, LocalDateTime placedAt,
        OrderStatus status, List<OrderItemDto> items, BigDecimal total) {

    static ReceivedOrderDetailDto from(CustomerOrder order) {
        return new ReceivedOrderDetailDto(order.getId(), order.getCustomer().getName(),
                order.getCustomer().getAddress(), order.getPlacedAt(), order.getStatus(),
                order.getItems().stream().map(OrderItemDto::from).toList(), order.getTotal());
    }
}