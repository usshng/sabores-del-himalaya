package com.foodordering.product;

import java.math.BigDecimal;

public record ProductDto(Long id, String name, String description, BigDecimal price, ProductCategory category) {

    static ProductDto from(Product product) {
        return new ProductDto(product.getId(), product.getName(), product.getDescription(), product.getPrice(),
                product.getCategory());
    }
}