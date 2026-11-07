package com.foodordering.billing;

import com.foodordering.order.CustomerOrder;
import com.foodordering.order.CustomerOrderRepository;
import com.foodordering.order.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BillingService {

    private final CustomerOrderRepository orderRepository;

    public BillingService(CustomerOrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    /**
     * Adds up the total amount of the orders placed on a day, without counting cancelled ones.
     *
     * @param date the day chosen by the owner
     * @return the number of orders counted and the total billed that day
     */
    @Transactional(readOnly = true)
    public DailyBillingDto getDailyBilling(LocalDate date) {
        List<CustomerOrder> orders = orderRepository.findByPlacedAtGreaterThanEqualAndPlacedAtLessThanAndStatusNot(
                date.atStartOfDay(), date.plusDays(1).atStartOfDay(), OrderStatus.CANCELLED);
        BigDecimal total = orders.stream()
                .map(CustomerOrder::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new DailyBillingDto(date, orders.size(), total);
    }
}