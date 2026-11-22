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
    @Column(precision = 8, scale = 2)
    private BigDecimal price;

    // The category is saved as a word and not as a number in database as we mentioned before.
    @Enumerated(EnumType.STRING)
    private ProductCategory category;

    // Only the products that are on the menu are shown for the clients and guests (US-01)
    // By default a new product starts on the menu (US-02)
    @Column(nullable = false)
    private boolean onMenu = true;

    // How a dish only for daily menus can be used: starter, main course or dessert (US-06).
    // It is null for the products of the menu, because their category already says it.
    @Enumerated(EnumType.STRING)
    private MenuUse menuUse;

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

    // Creates a dish only for daily menus (US-06). It is never on the menu,
    // so the customers can't order it alone, only inside a daily menu.
    public static Product menuDish(String name, String description, MenuUse menuUse) {
        Product dish = new Product();
        dish.name = name;
        dish.description = description;
        dish.menuUse = menuUse;
        dish.onMenu = false;
        return dish;
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

    public MenuUse getMenuUse() {
        return menuUse;
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

    // The part of a daily menu where this product can be used (US-05), or null if it can't be used.
    // Dishes only for daily menus go where the chef said (US-06); products of the menu go by their category:
    // starters and salads as starters, tandoori and main courses as main courses, desserts and drinks.
    public MenuCourse getMenuCourse() {
        if (menuUse != null) {
            return switch (menuUse) {
                case STARTER -> MenuCourse.STARTER;
                case MAIN_COURSE -> MenuCourse.MAIN_COURSE;
                case DESSERT -> MenuCourse.DESSERT;
            };
        }
        if (category == null) {
            return null;
        }
        return switch (category) {
            case STARTERS, SALADS -> MenuCourse.STARTER;
            case TANDOORI, MAIN_COURSES -> MenuCourse.MAIN_COURSE;
            case DESSERTS -> MenuCourse.DESSERT;
            case DRINKS -> MenuCourse.DRINK;
        };
    }
}