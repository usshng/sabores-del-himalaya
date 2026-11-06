package com.foodordering.order;

import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders/current")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public CurrentOrderDto getCurrentOrder(Authentication authentication) {
        return orderService.getCurrentOrder(authentication.getName());
    }

    @PostMapping("/items")
    public CurrentOrderDto addProduct(@Valid @RequestBody AddOrderItemRequest request,
            Authentication authentication) {
        return orderService.addProduct(authentication.getName(), request);
    }
}