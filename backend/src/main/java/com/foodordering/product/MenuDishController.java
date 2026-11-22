package com.foodordering.product;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

// REST endpoints of the dishes only for daily menus, used by the chef (US-06).
// As in ProductController, it only receives the requests and calls the service.
@RestController
@RequestMapping("/api/menu-dishes")
public class MenuDishController {

    private final ProductService productService;

    public MenuDishController(ProductService productService) {
        this.productService = productService;
    }

    // POST /api/menu-dishes, when the chef registers a new dish for daily menus (US-06).
    // @Valid checks the form data first (the API answers 400 if something is wrong);
    // if it works, the API answers 201 (created) with the new dish.
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductDto create(@Valid @RequestBody CreateMenuDishRequest request) {
        return productService.createMenuDish(request);
    }
}