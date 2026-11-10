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

    // Customer can cancel the order the first 10 minutes after confirmation (US-16)
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

    // Date and time the order was confirmed
    private LocalDateTime placedAt;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "order_id")
    private List<OrderItem> items = new ArrayList<>();

    protected CustomerOrder() {

    }

    public CustomerOrder(Customer customer) {
        this.customer = customer;
    }

    // to add a product that is in the order increases the quantity,
    // we avoid creating another line for the same product.
    public void addProduct(Product product, int quantity) {
        items.stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .findFirst()
                .ifPresentOrElse(item -> item.increaseQuantity(quantity),
                        () -> items.add(new OrderItem(product, quantity)));
    }

    // Sends the order to the staff, status "received", and shows the date and time of confirmation
    public void confirm(LocalDateTime now) {
        if (items.isEmpty()) {
            throw new EmptyOrderException();
        }
        this.status = OrderStatus.RECEIVED;
        this.placedAt = now;
    }

    // Staff can change status of the order
    public void changeStatus(OrderStatus newStatus) {
        if (status == OrderStatus.CANCELLED) {
            throw new CancelledOrderException();
        }
        if (!STAFF_STATUSES.contains(newStatus)) {
            throw new InvalidStatusChangeException();
        }
        this.status = newStatus;
    }

    // We don't delete the order when the status is cancelled.
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

    // the total amount, it is the price of each product multiplied by the quantity.
    public BigDecimal getTotal() {
        return items.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}