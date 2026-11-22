package com.foodordering.order;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

    @GetMapping("/{id}")
    public PlacedOrderDto getMyOrder(@PathVariable Long id, Authentication authentication) {
        return orderService.getMyOrder(authentication.getName(), id);
    }

    @PutMapping("/{id}")
    public PlacedOrderDto modify(@PathVariable Long id, @Valid @RequestBody ModifyOrderRequest request,
            Authentication authentication) {
        return orderService.modify(authentication.getName(), id, request);
    }

    @PostMapping("/{id}/cancellation")
    public MyOrderDto cancel(@PathVariable Long id, Authentication authentication) {
        return orderService.cancel(authentication.getName(), id);
    }
}