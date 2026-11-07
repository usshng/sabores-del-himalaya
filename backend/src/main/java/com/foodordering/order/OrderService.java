package com.foodordering.order;

import com.foodordering.customer.Customer;
import com.foodordering.customer.CustomerRepository;
import com.foodordering.product.Product;
import com.foodordering.product.ProductRepository;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

    private final CustomerOrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final Clock clock;

    public OrderService(CustomerOrderRepository orderRepository, CustomerRepository customerRepository,
            ProductRepository productRepository, Clock clock) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.clock = clock;
    }

    /**
     * Returns the order the customer is composing, which stays saved until it is confirmed.
     *
     * @param login the login of the logged-in customer
     * @return the order in progress, or an empty order if the customer has not added anything yet
     */
    @Transactional(readOnly = true)
    public CurrentOrderDto getCurrentOrder(String login) {
        Customer customer = findCustomer(login);
        return orderRepository.findByCustomerAndStatus(customer, OrderStatus.IN_PROGRESS)
                .map(CurrentOrderDto::from)
                .orElse(CurrentOrderDto.EMPTY);
    }

    /**
     * Adds a product of the menu to the customer's order in progress, creating the order if needed.
     *
     * @param login the login of the logged-in customer
     * @param request the product and the quantity chosen
     * @return the order in progress after adding the product
     * @throws ProductNotAvailableException if the product does not exist or has been withdrawn from the menu
     */
    @Transactional
    public CurrentOrderDto addProduct(String login, AddOrderItemRequest request) {
        Customer customer = findCustomer(login);
        Product product = productRepository.findById(request.productId())
                .filter(Product::isOnMenu)
                .orElseThrow(ProductNotAvailableException::new);
        CustomerOrder order = orderRepository.findByCustomerAndStatus(customer, OrderStatus.IN_PROGRESS)
                .orElseGet(() -> orderRepository.save(new CustomerOrder(customer)));
        order.addProduct(product, request.quantity());
        return CurrentOrderDto.from(order);
    }

    /**
     * Confirms the customer's order in progress and sends it to the restaurant with status Received.
     *
     * @param login the login of the logged-in customer
     * @return the placed order with its content, total and the date and time it was placed
     * @throws EmptyOrderException if the customer has no products in the order
     */
    @Transactional
    public PlacedOrderDto confirm(String login) {
        Customer customer = findCustomer(login);
        CustomerOrder order = orderRepository.findByCustomerAndStatus(customer, OrderStatus.IN_PROGRESS)
                .orElseThrow(EmptyOrderException::new);
        order.confirm(LocalDateTime.now(clock));
        return PlacedOrderDto.from(order);
    }

    private Customer findCustomer(String login) {
        return customerRepository.findByLogin(login).orElseThrow();
    }

    /**
     * Returns the orders the customer has placed, from the newest to the oldest, with their current status.
     *
     * @param login the login of the logged-in customer
     * @return the customer's placed orders with date and time, total amount and status
     */
    @Transactional(readOnly = true)
    public List<MyOrderDto> getMyOrders(String login) {
        Customer customer = findCustomer(login);
        return orderRepository.findByCustomerAndStatusNotOrderByPlacedAtDesc(customer, OrderStatus.IN_PROGRESS)
                .stream()
                .map(MyOrderDto::from)
                .toList();
    }
}