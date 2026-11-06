package com.foodordering.order;

import java.time.LocalDateTime;

public record ReceivedOrderDto(Long id, String customerName, String customerAddress, LocalDateTime placedAt,
        OrderStatus status) {

    static ReceivedOrderDto from(CustomerOrder order) {
        return new ReceivedOrderDto(order.getId(), order.getCustomer().getName(), order.getCustomer().getAddress(),
                order.getPlacedAt(), order.getStatus());
    }
}