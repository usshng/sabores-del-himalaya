package com.foodordering.order;

import com.foodordering.customer.Customer;
import com.foodordering.product.Product;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Entity
public class CustomerOrder {

    // The customer can cancel an order for free during the first 10 minutes after placing it (US-16).
    public static final Duration CANCELLATION_PERIOD = Duration.ofMinutes(10);

    private static final Set<OrderStatus> STAFF_STATUSES =
            Set.of(OrderStatus.IN_PREPARATION, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED);

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.IN_PROGRESS;

    // Date and time the order was placed; empty while it is still in progress.
    private LocalDateTime placedAt;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "order_id")
    private List<OrderItem> items = new ArrayList<>();

    protected CustomerOrder() {
        // Required by JPA
    }

    public CustomerOrder(Customer customer) {
        this.customer = customer;
    }

    // Adding a product that is already in the order increases its quantity instead of creating a second line.
    public void addProduct(Product product, int quantity) {
        items.stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .findFirst()
                .ifPresentOrElse(item -> item.increaseQuantity(quantity),
                        () -> items.add(new OrderItem(product, quantity)));
    }

    // Sends the order to the restaurant (US-14): it becomes Received and keeps the date and time it was placed.
    public void confirm(LocalDateTime now) {
        if (items.isEmpty()) {
            throw new EmptyOrderException();
        }
        this.status = OrderStatus.RECEIVED;
        this.placedAt = now;
    }

    // Staff move the order forward (US-19); only the customer can cancel it (US-16).
    public void changeStatus(OrderStatus newStatus) {
        if (status == OrderStatus.CANCELLED) {
            throw new CancelledOrderException();
        }
        if (!STAFF_STATUSES.contains(newStatus)) {
            throw new InvalidStatusChangeException();
        }
        this.status = newStatus;
    }

    // The order is kept with status Cancelled instead of being deleted (US-16).
    public void cancel(LocalDateTime now) {
        if (status == OrderStatus.CANCELLED) {
            throw new CancelledOrderException();
        }
        if (now.isAfter(placedAt.plus(CANCELLATION_PERIOD))) {
            throw new CancellationPeriodExpiredException();
        }
        this.status = OrderStatus.CANCELLED;
    }

    public Long getId() {
        return id;
    }

    public Customer getCustomer() {
        return customer;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public LocalDateTime getPlacedAt() {
        return placedAt;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    // Total amount (US-13): the price of each product multiplied by its quantity, added up.
    public BigDecimal getTotal() {
        return items.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}