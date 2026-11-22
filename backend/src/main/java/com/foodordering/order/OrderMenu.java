package com.foodordering.order;

import com.foodordering.dailymenu.DailyMenu;
import com.foodordering.product.Product;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import java.math.BigDecimal;

// A daily menu inside an order (US-12): the customer chooses one starter, one main course and one dessert
// of today's menu, and the drink is included. Each menu is its own line, because two menus of the same
// order can have different dishes.
@Entity
public class OrderMenu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private DailyMenu dailyMenu;

    @ManyToOne(optional = false)
    private Product starter;

    @ManyToOne(optional = false)
    private Product mainCourse;

    @ManyToOne(optional = false)
    private Product dessert;

    // We save the price, like OrderItem does, so the placed orders keep it if one day the price changes.
    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal price;

    protected OrderMenu() {
    }

    // The service checks that the dishes are options of the menu before creating it (see OrderService).
    OrderMenu(DailyMenu dailyMenu, Product starter, Product mainCourse, Product dessert) {
        this.dailyMenu = dailyMenu;
        this.starter = starter;
        this.mainCourse = mainCourse;
        this.dessert = dessert;
        this.price = DailyMenu.PRICE;
    }

    public Long getId() {
        return id;
    }

    public Product getStarter() {
        return starter;
    }

    public Product getMainCourse() {
        return mainCourse;
    }

    public Product getDessert() {
        return dessert;
    }

    // The drink is not chosen: it is the one of the daily menu.
    public Product getDrink() {
        return dailyMenu.getDrink();
    }

    public BigDecimal getPrice() {
        return price;
    }
}