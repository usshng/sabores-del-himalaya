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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
public class CustomerOrder {

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
}