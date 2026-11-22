package com.foodordering.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// The data that the chef sends from the new dish form (P12) to register a dish only for daily menus (US-06).
// Spring checks these rules before calling the service, so if something is wrong the API answers 400.
public record CreateMenuDishRequest(
        // The name is required.
        @NotBlank String name,
        // The description is optional.
        String description,
        // How the dish can be used in the menu: starter, main course or dessert.
        @NotNull MenuUse menuUse) {
}