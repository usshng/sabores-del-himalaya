package com.foodordering.dailymenu;

import com.foodordering.product.Product;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

// The daily menu of one day (US-05): three starters, three main courses, two desserts and one drink.
// Each list of dishes is stored in its own join table, so the same dish can be used in many menus.
@Entity
public class DailyMenu {

    // The price is fixed for every menu (US-05), so it is a constant and not a column.
    public static final BigDecimal PRICE = new BigDecimal("15.00");

    // How many options each part of the menu has (US-05).
    public static final int STARTER_OPTIONS = 3;
    public static final int MAIN_COURSE_OPTIONS = 3;
    public static final int DESSERT_OPTIONS = 2;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The day of the menu. It is unique, so a day can't have two menus (US-05).
    // It is called menuDate because "date" is a reserved word in some databases.
    @Column(nullable = false, unique = true)
    private LocalDate menuDate;

    @ManyToMany
    @JoinTable(name = "daily_menu_starter", joinColumns = @JoinColumn(name = "daily_menu_id"),
            inverseJoinColumns = @JoinColumn(name = "product_id"))
    private List<Product> starters = new ArrayList<>();

    @ManyToMany
    @JoinTable(name = "daily_menu_main_course", joinColumns = @JoinColumn(name = "daily_menu_id"),
            inverseJoinColumns = @JoinColumn(name = "product_id"))
    private List<Product> mainCourses = new ArrayList<>();

    @ManyToMany
    @JoinTable(name = "daily_menu_dessert", joinColumns = @JoinColumn(name = "daily_menu_id"),
            inverseJoinColumns = @JoinColumn(name = "product_id"))
    private List<Product> desserts = new ArrayList<>();

    @ManyToOne(optional = false)
    private Product drink;

    // JPA needs this empty constructor to rebuild the object when it reads a row.
    protected DailyMenu() {
    }

    // The service checks the dishes before creating the menu (see DailyMenuService).
    public DailyMenu(LocalDate menuDate, List<Product> starters, List<Product> mainCourses, List<Product> desserts,
            Product drink) {
        this.menuDate = menuDate;
        this.starters = new ArrayList<>(starters);
        this.mainCourses = new ArrayList<>(mainCourses);
        this.desserts = new ArrayList<>(desserts);
        this.drink = drink;
    }

    public Long getId() {
        return id;
    }

    public LocalDate getMenuDate() {
        return menuDate;
    }

    public List<Product> getStarters() {
        return List.copyOf(starters);
    }

    public List<Product> getMainCourses() {
        return List.copyOf(mainCourses);
    }

    public List<Product> getDesserts() {
        return List.copyOf(desserts);
    }

    public Product getDrink() {
        return drink;
    }
}