package com.foodordering.order;

import com.foodordering.product.Product;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import java.math.BigDecimal;

@Entity
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Product product;

    // Price at the moment the product was added, so later menu changes do not alter existing orders.
    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal unitPrice;

    @Column(nullable = false)
    private int quantity;

    protected OrderItem() {
        // Required by JPA
    }

    OrderItem(Product product, int quantity) {
        this.product = product;
        this.unitPrice = product.getPrice();
        this.quantity = quantity;
    }

    void increaseQuantity(int extra) {
        this.quantity += extra;
    }

    public Product getProduct() {
        return product;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public int getQuantity() {
        return quantity;
    }
}