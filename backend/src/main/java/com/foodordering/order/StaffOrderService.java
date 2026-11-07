package com.foodordering.order;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StaffOrderService {

    private final CustomerOrderRepository orderRepository;

    public StaffOrderService(CustomerOrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    /**
     * Returns the orders confirmed by customers, from the oldest to the newest, so they are prepared in order.
     *
     * @return the confirmed orders with the customer's name and address, date and time, and status
     */
    @Transactional(readOnly = true)
    public List<ReceivedOrderDto> getReceivedOrders() {
        return orderRepository.findByStatusNotOrderByPlacedAtAsc(OrderStatus.IN_PROGRESS).stream()
                .map(ReceivedOrderDto::from)
                .toList();
    }

    /**
     * Returns the content and total amount of a confirmed order.
     *
     * @param id the order selected in the list
     * @return the order with its products, quantities and total amount
     * @throws OrderNotFoundException if there is no confirmed order with that id
     */
    @Transactional(readOnly = true)
    public ReceivedOrderDetailDto getReceivedOrder(Long id) {
        return orderRepository.findByIdAndStatusNot(id, OrderStatus.IN_PROGRESS)
                .map(ReceivedOrderDetailDto::from)
                .orElseThrow(OrderNotFoundException::new);
    }

    /**
     * Changes the status of a confirmed order, so the customer can follow it.
     *
     * @param id the order selected in the list
     * @param request the new status chosen by the staff
     * @return the order with its new status
     * @throws OrderNotFoundException if there is no confirmed order with that id
     * @throws InvalidStatusChangeException if the new status is not one the staff can set
     * @throws CancelledOrderException if the order was cancelled by the customer
     */
    @Transactional
    public ReceivedOrderDetailDto updateStatus(Long id, UpdateOrderStatusRequest request) {
        CustomerOrder order = orderRepository.findByIdAndStatusNot(id, OrderStatus.IN_PROGRESS)
                .orElseThrow(OrderNotFoundException::new);
        order.changeStatus(request.status());
        return ReceivedOrderDetailDto.from(order);
    }
}