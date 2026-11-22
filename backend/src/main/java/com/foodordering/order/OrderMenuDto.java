package com.foodordering.order;

import java.math.BigDecimal;

// A daily menu of the order with the names of the chosen dishes, so the customer and the staff can read it.
public record OrderMenuDto(Long id, String starter, String mainCourse, String dessert, String drink,
        BigDecimal price) {

    static OrderMenuDto from(OrderMenu menu) {
        return new OrderMenuDto(menu.getId(), menu.getStarter().getName(), menu.getMainCourse().getName(),
                menu.getDessert().getName(), menu.getDrink().getName(), menu.getPrice());
    }
}