package com.foodordering.order;

import java.util.List;

public record CurrentOrderDto(List<OrderItemDto> items) {

    static final CurrentOrderDto EMPTY = new CurrentOrderDto(List.of());

    static CurrentOrderDto from(CustomerOrder order) {
        return new CurrentOrderDto(order.getItems().stream().map(OrderItemDto::from).toList());
    }
}