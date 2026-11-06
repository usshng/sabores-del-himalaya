package com.foodordering.order;

import java.math.BigDecimal;
import java.util.List;

public record CurrentOrderDto(List<OrderItemDto> items, BigDecimal total) {

    static final CurrentOrderDto EMPTY = new CurrentOrderDto(List.of(), BigDecimal.ZERO);

    static CurrentOrderDto from(CustomerOrder order) {
        return new CurrentOrderDto(order.getItems().stream().map(OrderItemDto::from).toList(), order.getTotal());
    }
}