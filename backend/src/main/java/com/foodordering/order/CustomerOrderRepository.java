package com.foodordering.order;

import com.foodordering.customer.Customer;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {

    Optional<CustomerOrder> findByCustomerAndStatus(Customer customer, OrderStatus status);
}