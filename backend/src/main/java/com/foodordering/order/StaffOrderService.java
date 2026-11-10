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
     * Returns the orders confirmed, it is ordered from the oldest to the newest.
     *
     * @return the confirmed orders and the details
     */
    @Transactional(readOnly = true)
    public List<ReceivedOrderDto> getReceivedOrders() {
        return orderRepository.findByStatusNotOrderByPlacedAtAsc(OrderStatus.IN_PROGRESS).stream()
                .map(ReceivedOrderDto::from)
                .toList();
    }

    /**
     * Returns the content of the order and the total amount.
     *
     * @param id the id of the order
     * @return the order with the products, quantity, and total amount of the order
     * @throws OrderNotFoundException no confirmed order with that id
     */
    @Transactional(readOnly = true)
    public ReceivedOrderDetailDto getReceivedOrder(Long id) {
        return orderRepository.findByIdAndStatusNot(id, OrderStatus.IN_PROGRESS)
                .map(ReceivedOrderDetailDto::from)
                .orElseThrow(OrderNotFoundException::new);
    }

    /**
     * Changes the status of the order, so the customer can see it.
     *
     * @param id of the order
     * @param request the new status
     * @return the order with the status updated
     * @throws OrderNotFoundException in case that there is not order with that id
     * @throws InvalidStatusChangeException any status that staff can't put to the order
     * @throws CancelledOrderException if the order is cancelled while staff is changing the status
     */
    @Transactional
    public ReceivedOrderDetailDto updateStatus(Long id, UpdateOrderStatusRequest request) {
        CustomerOrder order = orderRepository.findByIdAndStatusNot(id, OrderStatus.IN_PROGRESS)
                .orElseThrow(OrderNotFoundException::new);
        order.changeStatus(request.status());
        return ReceivedOrderDetailDto.from(order);
    }
}