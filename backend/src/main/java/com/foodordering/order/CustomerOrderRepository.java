package com.foodordering.order;

import com.foodordering.customer.Customer;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {

    Optional<CustomerOrder> findByCustomerAndStatus(Customer customer, OrderStatus status);

    List<CustomerOrder> findByStatusNotOrderByPlacedAtAsc(OrderStatus status);

    Optional<CustomerOrder> findByIdAndStatusNot(Long id, OrderStatus status);

    List<CustomerOrder> findByCustomerAndStatusNotOrderByPlacedAtDesc(Customer customer, OrderStatus status);

    Optional<CustomerOrder> findByIdAndCustomerAndStatusNot(Long id, Customer customer, OrderStatus status);

    List<CustomerOrder> findByPlacedAtGreaterThanEqualAndPlacedAtLessThanAndStatusNot(LocalDateTime start,
            LocalDateTime end, OrderStatus status);
}