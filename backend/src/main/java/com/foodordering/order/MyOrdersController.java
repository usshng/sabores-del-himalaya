package com.foodordering.order;

import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class MyOrdersController {

    private final OrderService orderService;

    public MyOrdersController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public List<MyOrderDto> getMyOrders(Authentication authentication) {
        return orderService.getMyOrders(authentication.getName());
    }

    @PostMapping("/{id}/cancellation")
    public MyOrderDto cancel(@PathVariable Long id, Authentication authentication) {
        return orderService.cancel(authentication.getName(), id);
    }
}