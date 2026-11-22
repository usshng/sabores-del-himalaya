package com.foodordering.dailymenu;

import com.foodordering.product.MenuCourse;
import com.foodordering.product.Product;
import com.foodordering.product.ProductRepository;
import java.util.HashSet;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// Business logic of the daily menu. All the rules of the menu live here, so the controller only calls these methods.
@Service
public class DailyMenuService {

    private final DailyMenuRepository dailyMenuRepository;
    private final ProductRepository productRepository;

    public DailyMenuService(DailyMenuRepository dailyMenuRepository, ProductRepository productRepository) {
        this.dailyMenuRepository = dailyMenuRepository;
        this.productRepository = productRepository;
    }

    /**
     * Configures the menu of a day (US-05). Each dish must exist, not be repeated and go in its part of the menu:
     * starters and salads as starters, tandoori and main courses as main courses, desserts as desserts,
     * and a drink of the menu as the drink. Dishes only for menus (US-06) go where the chef said.
     *
     * @param request the day and the dishes chosen in the daily menu form
     * @return the created menu, with its fixed price
     * @throws DailyMenuAlreadyExistsException if that day already has a menu (the API answers 409)
     * @throws InvalidDailyMenuException if a dish is not valid for its part of the menu (the API answers 400)
     */
    @Transactional
    public DailyMenuDto create(CreateDailyMenuRequest request) {
        if (dailyMenuRepository.existsByMenuDate(request.date())) {
            throw new DailyMenuAlreadyExistsException();
        }
        List<Product> starters = findDishes(request.starterIds(), MenuCourse.STARTER);
        List<Product> mainCourses = findDishes(request.mainCourseIds(), MenuCourse.MAIN_COURSE);
        List<Product> desserts = findDishes(request.dessertIds(), MenuCourse.DESSERT);
        Product drink = findDish(request.drinkId(), MenuCourse.DRINK);
        // The drink must be on the menu (US-05: "una bebida de la categoría de bebidas de la carta").
        if (!drink.isOnMenu()) {
            throw new InvalidDailyMenuException();
        }
        DailyMenu menu = new DailyMenu(request.date(), starters, mainCourses, desserts, drink);
        return DailyMenuDto.from(dailyMenuRepository.save(menu));
    }

    // Finds the dishes of one part of the menu. They can't be repeated, so each option is different.
    private List<Product> findDishes(List<Long> ids, MenuCourse course) {
        if (new HashSet<>(ids).size() != ids.size()) {
            throw new InvalidDailyMenuException();
        }
        return ids.stream().map(id -> findDish(id, course)).toList();
    }

    // Finds one dish and checks that it can go in that part of the menu.
    private Product findDish(Long id, MenuCourse course) {
        Product product = productRepository.findById(id).orElseThrow(InvalidDailyMenuException::new);
        if (product.getMenuCourse() != course) {
            throw new InvalidDailyMenuException();
        }
        return product;
    }
}