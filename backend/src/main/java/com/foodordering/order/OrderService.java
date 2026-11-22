package com.foodordering.order;

import com.foodordering.customer.Customer;
import com.foodordering.customer.CustomerRepository;
import com.foodordering.dailymenu.DailyMenu;
import com.foodordering.dailymenu.DailyMenuNotFoundException;
import com.foodordering.dailymenu.DailyMenuRepository;
import com.foodordering.product.Product;
import com.foodordering.product.ProductRepository;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

    private final CustomerOrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final DailyMenuRepository dailyMenuRepository;
    private final Clock clock;

    public OrderService(CustomerOrderRepository orderRepository, CustomerRepository customerRepository,
            ProductRepository productRepository, DailyMenuRepository dailyMenuRepository, Clock clock) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.dailyMenuRepository = dailyMenuRepository;
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
        Product product = findAvailableProduct(request.productId());
        CustomerOrder order = orderRepository.findByCustomerAndStatus(customer, OrderStatus.IN_PROGRESS)
                .orElseGet(() -> orderRepository.save(new CustomerOrder(customer)));
        order.addProduct(product, request.quantity());
        return CurrentOrderDto.from(order);
    }

    /**
     * Adds today's daily menu to the customer's order in progress, with the dishes the customer has chosen.
     *
     * @param login the login of the logged-in customer
     * @param request the starter, the main course and the dessert chosen
     * @return the order in progress after adding the menu
     * @throws DailyMenuNotFoundException if there is no daily menu for today
     * @throws InvalidMenuChoiceException if a chosen dish is not an option of today's menu
     */
    @Transactional
    public CurrentOrderDto addMenu(String login, AddOrderMenuRequest request) {
        Customer customer = findCustomer(login);
        OrderMenu menu = createMenu(request);
        CustomerOrder order = orderRepository.findByCustomerAndStatus(customer, OrderStatus.IN_PROGRESS)
                .orElseGet(() -> orderRepository.save(new CustomerOrder(customer)));
        order.addMenu(menu);
        // We flush so the new menu gets its id before we answer, the frontend uses it to list the menus.
        orderRepository.flush();
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

    /**
     * Returns one of the customer's placed orders with its content, so the customer can modify it (US-15).
     *
     * @param login the login of the logged-in customer
     * @param orderId the placed order
     * @return the order with its products, menus, total, status and the date and time it was placed
     * @throws OrderNotFoundException if the customer has no placed order with that id
     */
    @Transactional(readOnly = true)
    public PlacedOrderDto getMyOrder(String login, Long orderId) {
        return PlacedOrderDto.from(findPlacedOrder(login, orderId));
    }

    /**
     * Modifies a placed order, free of charge, within 10 minutes of placing it. The customer can add or
     * remove products and menus and change the quantities, and the total is updated (US-15).
     *
     * @param login the login of the logged-in customer
     * @param orderId the order the customer wants to modify
     * @param request the new products with their quantities, the menus kept and the new menus
     * @return the order with its new content and total
     * @throws OrderNotFoundException if the customer has no placed order with that id
     * @throws ModificationPeriodExpiredException if more than 10 minutes have passed since it was placed
     * @throws CancelledOrderException if the order was cancelled
     * @throws ProductNotAvailableException if a new product is not in the menu
     * @throws EmptyOrderException if the order would be empty, then the customer has to cancel it
     */
    @Transactional
    public PlacedOrderDto modify(String login, Long orderId, ModifyOrderRequest request) {
        CustomerOrder order = findPlacedOrder(login, orderId);
        order.checkCanBeModified(LocalDateTime.now(clock));
        Map<Long, Integer> quantities = request.items().stream()
                .collect(Collectors.toMap(OrderLineRequest::productId, OrderLineRequest::quantity,
                        (first, second) -> second));
        order.keepProducts(quantities);
        // The products that were not in the order are new, so they have to be available in the menu.
        quantities.forEach((productId, quantity) -> {
            if (!order.hasProduct(productId)) {
                order.addProduct(findAvailableProduct(productId), quantity);
            }
        });
        order.keepMenus(Set.copyOf(request.keptMenuIds()));
        request.newMenus().forEach(menu -> order.addMenu(createMenu(menu)));
        if (order.isEmpty()) {
            throw new EmptyOrderException();
        }
        orderRepository.flush();
        return PlacedOrderDto.from(order);
    }

    /**
     * Cancels one of the customer's placed orders, free of charge, within 10 minutes of placing it.
     *
     * @param login the login of the logged-in customer
     * @param orderId the order the customer wants to cancel
     * @return the order with status Cancelled
     * @throws OrderNotFoundException if the customer has no placed order with that id
     * @throws CancellationPeriodExpiredException if more than 10 minutes have passed since it was placed
     * @throws CancelledOrderException if the order was already cancelled
     */
    @Transactional
    public MyOrderDto cancel(String login, Long orderId) {
        CustomerOrder order = findPlacedOrder(login, orderId);
        order.cancel(LocalDateTime.now(clock));
        return MyOrderDto.from(order);
    }

    private Customer findCustomer(String login) {
        return customerRepository.findByLogin(login).orElseThrow();
    }

    // The order in progress is not placed yet, so the customer can't see it here.
    private CustomerOrder findPlacedOrder(String login, Long orderId) {
        return orderRepository
                .findByIdAndCustomerAndStatusNot(orderId, findCustomer(login), OrderStatus.IN_PROGRESS)
                .orElseThrow(OrderNotFoundException::new);
    }

    private Product findAvailableProduct(Long productId) {
        return productRepository.findById(productId)
                .filter(Product::isOnMenu)
                .orElseThrow(ProductNotAvailableException::new);
    }

    // Only today's menu can be ordered (US-12), with one option of each part.
    private OrderMenu createMenu(AddOrderMenuRequest request) {
        DailyMenu dailyMenu = dailyMenuRepository.findByMenuDate(LocalDate.now(clock))
                .orElseThrow(DailyMenuNotFoundException::new);
        return new OrderMenu(dailyMenu, findOption(dailyMenu.getStarters(), request.starterId()),
                findOption(dailyMenu.getMainCourses(), request.mainCourseId()),
                findOption(dailyMenu.getDesserts(), request.dessertId()));
    }

    // The dish has to be one of the options of its part of the menu, so a dessert can't be chosen as starter.
    private Product findOption(List<Product> options, Long dishId) {
        return options.stream()
                .filter(dish -> dish.getId().equals(dishId))
                .findFirst()
                .orElseThrow(InvalidMenuChoiceException::new);
    }
}