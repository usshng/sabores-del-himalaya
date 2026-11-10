package com.foodordering.product;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.math.BigDecimal;

// A product of the restaurant's menu (US-01). The main idea here is that JPA turns this class
// into the product table, so each Product object is one row of the table.
// We don't use setters on purpose, so a product can only change with methods that make sense,
// such as update() for US-03, withdraw() for US-04, which we add in their own user stories.
@Entity
public class Product {

    // The id is the primary key, and MySQL generates it (1,2,3,4,etc) for each when we save a new product.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    // The description of a product is optional, so a product can be saved without a description.
    private String description;

    // In this case we use BigDecimal instead of double because money can't have rounding errors.
    // Because if we use double, for example for: 0.1 + 0.7 is not exactly 0.8. For BigDecimal, it shows up
    // to 8 digits, 2 of them decimals.
    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal price;

    // The category is saved as a word and not as a number in database as we mentioned before.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductCategory category;

    // Only the products that are on the menu are shown for the clients and guests (US-01)
    // By default a new product starts on the menu (US-02)
    @Column(nullable = false)
    private boolean onMenu = true;

    // JPA (a.k.a Jakarta Persistence API) needs an empty constructor to rebuild the object
    // when it reads a row.
    protected Product() {

    }

    // Constructor to create a new product, we don't use this.id = id; because id is assigned by database
    public Product(String name, String description, BigDecimal price, ProductCategory category) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
    }

    // some methods to get product's details
    // for the product id
    public Long getId() {
        return id;
    }

    // for the name of the product
    public String getName() {
        return name;
    }

    // for the description of the product
    public String getDescription() {
        return description;
    }

    // to get the price in BigDecimal format
    public BigDecimal getPrice() {
        return price;
    }

    // to get the category of the product
    public ProductCategory getCategory() {
        return category;
    }

    // to know if is on the menu
    public boolean isOnMenu() {
        return onMenu;
    }

    // to withdraw, is not on menu = false
    public void withdraw() {
        this.onMenu = false;
    }

    // to update a product
    public void update(String name, String description, BigDecimal price, ProductCategory category) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
    }
}