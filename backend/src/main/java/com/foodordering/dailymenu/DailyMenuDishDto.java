package com.foodordering.dailymenu;

import com.foodordering.product.Product;

// A dish of a daily menu, with only the data the screens need.
public record DailyMenuDishDto(Long id, String name, String description) {

    public static DailyMenuDishDto from(Product product) {
        return new DailyMenuDishDto(product.getId(), product.getName(), product.getDescription());
    }
}