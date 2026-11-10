package com.foodordering.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

// This is for the data that the owner sends from the product from of P9 when adding a product (US-02)
// The main idea here is that Spring checks the rules, in our case,
// name of the new product must not be blank, price, category can't be null,
// the description of the new product is optional.
// So the API answers 400 and the product is not saved if we broke any of these rules.
public record CreateProductRequest(
        @NotBlank String name,
        String description,
        @NotNull @Positive BigDecimal price,
        @NotNull ProductCategory category) {
}