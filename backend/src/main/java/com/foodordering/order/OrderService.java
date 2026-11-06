package com.foodordering.order;

import com.foodordering.customer.Customer;
import com.foodordering.customer.CustomerRepository;
import com.foodordering.product.Product;
import com.foodordering.product.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

    private final CustomerOrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public OrderService(CustomerOrderRepository orderRepository, CustomerRepository customerRepository,
            ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
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

    private Customer findCustomer(String login) {
        return customerRepository.findByLogin(login).orElseThrow();
    }
}