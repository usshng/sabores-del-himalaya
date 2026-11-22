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
import java.util.Map;
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

    // The daily menus of the order (US-12). They go apart from the products, because a menu has three
    // dishes and a fixed price.
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "order_id")
    private List<OrderMenu> menus = new ArrayList<>();

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

    // Each menu is a new line, we don't join it with another menu because the dishes can be different.
    public void addMenu(OrderMenu menu) {
        menus.add(menu);
    }

    // Sends the order to the staff, status "received", and shows the date and time of confirmation
    public void confirm(LocalDateTime now) {
        if (items.isEmpty() && menus.isEmpty()) {
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

    // The customer can modify the order the first 10 minutes after confirmation (US-15), the same period
    // as cancelling it. The period counts from placedAt, so it doesn't start again after a modification.
    public void checkCanBeModified(LocalDateTime now) {
        if (status == OrderStatus.CANCELLED) {
            throw new CancelledOrderException();
        }
        if (now.isAfter(placedAt.plus(CANCELLATION_PERIOD))) {
            throw new ModificationPeriodExpiredException();
        }
    }

    // The products that are not in the new quantities are removed. The others change their quantity and
    // keep the price they had when the order was placed (US-15).
    public void keepProducts(Map<Long, Integer> quantities) {
        items.removeIf(item -> !quantities.containsKey(item.getProduct().getId()));
        items.forEach(item -> item.changeQuantity(quantities.get(item.getProduct().getId())));
    }

    public boolean hasProduct(Long productId) {
        return items.stream().anyMatch(item -> item.getProduct().getId().equals(productId));
    }

    // The menus that the customer doesn't keep are removed from the order (US-15).
    public void keepMenus(Set<Long> menuIds) {
        menus.removeIf(menu -> !menuIds.contains(menu.getId()));
    }

    public boolean isEmpty() {
        return items.isEmpty() && menus.isEmpty();
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

    public List<OrderMenu> getMenus() {
        return menus;
    }

    // the total amount, it is the price of each product multiplied by the quantity.
    // We also add the price of each daily menu (US-12).
    public BigDecimal getTotal() {
        BigDecimal products = items.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal dailyMenus = menus.stream()
                .map(OrderMenu::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return products.add(dailyMenus);
    }
}