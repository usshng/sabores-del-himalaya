package com.foodordering.order;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/staff/orders")
public class StaffOrderController {

    private final StaffOrderService staffOrderService;

    public StaffOrderController(StaffOrderService staffOrderService) {
        this.staffOrderService = staffOrderService;
    }

    @GetMapping
    public List<ReceivedOrderDto> getReceivedOrders() {
        return staffOrderService.getReceivedOrders();
    }

    @GetMapping("/{id}")
    public ReceivedOrderDetailDto getReceivedOrder(@PathVariable Long id) {
        return staffOrderService.getReceivedOrder(id);
    }

    @PatchMapping("/{id}/status")
    public ReceivedOrderDetailDto updateStatus(@PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusRequest request) {
        return staffOrderService.updateStatus(id, request);
    }
}