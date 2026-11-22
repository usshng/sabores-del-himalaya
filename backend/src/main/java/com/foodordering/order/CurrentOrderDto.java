package com.foodordering.order;

import java.math.BigDecimal;
import java.util.List;

public record CurrentOrderDto(List<OrderItemDto> items, List<OrderMenuDto> menus, BigDecimal total) {

    static final CurrentOrderDto EMPTY = new CurrentOrderDto(List.of(), List.of(), BigDecimal.ZERO);

    static CurrentOrderDto from(CustomerOrder order) {
        return new CurrentOrderDto(order.getItems().stream().map(OrderItemDto::from).toList(),
                order.getMenus().stream().map(OrderMenuDto::from).toList(), order.getTotal());
    }
}