package com.foodordering.product;

// A dish that the chef can choose when configuring a daily menu (US-05). It shows the name,
// the category and the use in the menu, as the user story asks, plus the part of the menu where it goes.
// The category is null for dishes only for menus, and the menu use is null for products of the menu.
public record MenuDishOptionDto(Long id, String name, ProductCategory category, MenuUse menuUse, MenuCourse course) {

    public static MenuDishOptionDto from(Product product) {
        return new MenuDishOptionDto(product.getId(), product.getName(), product.getCategory(),
                product.getMenuUse(), product.getMenuCourse());
    }
}