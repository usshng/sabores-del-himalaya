package com.foodordering.product;

import java.math.BigDecimal;

// We only send the necessary data of the product to the frontend.
// We don't return the entire entity.
public record ProductDto(Long id, String name, String description, BigDecimal price, ProductCategory category) {

    // DTO stands for Data Transfer Object, to carry data between backend and frontend
    static ProductDto from(Product product) {
        return new ProductDto(product.getId(), product.getName(), product.getDescription(), product.getPrice(),
                product.getCategory());
    }
}