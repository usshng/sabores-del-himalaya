package com.foodordering.dailymenu;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.foodordering.product.MenuUse;
import com.foodordering.product.Product;
import com.foodordering.product.ProductCategory;
import com.foodordering.product.ProductRepository;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

// Tests of the configuration of the daily menu (US-05).
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DailyMenuControllerTests {

    private static final String DAY = "2026-12-01";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DailyMenuRepository dailyMenuRepository;

    @Autowired
    private ProductRepository productRepository;

    private List<Long> starters;
    private List<Long> mainCourses;
    private List<Long> desserts;
    private Long drink;

    // Each test starts with the same dishes: starters (one is a salad), main courses (one is tandoori),
    // desserts and a drink, so we can build a valid menu.
    @BeforeEach
    void createDishes() {
        starters = List.of(save("Momos", ProductCategory.STARTERS), save("Samosas", ProductCategory.STARTERS),
                save("Ensalada Himalaya", ProductCategory.SALADS));
        mainCourses = List.of(save("Dal bhat", ProductCategory.MAIN_COURSES),
                save("Curry de cordero", ProductCategory.MAIN_COURSES),
                save("Pollo tandoori", ProductCategory.TANDOORI));
        desserts = List.of(save("Kheer", ProductCategory.DESSERTS), save("Gulab jamun", ProductCategory.DESSERTS));
        drink = save("Lassi", ProductCategory.DRINKS);
    }

    // The menus point to the products, so they are deleted first; then the products, for the other tests.
    @AfterEach
    void clearDatabase() {
        dailyMenuRepository.deleteAll();
        productRepository.deleteAll();
    }

    // US-05: the chef configures the menu of a day with its dishes, and the price is 15 €.
    @Test
    @WithMockUser(username = "chef", roles = "CHEF")
    void chefConfiguresDailyMenu() throws Exception {
        createMenu(starters, mainCourses, desserts, drink)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.date").value(DAY))
                .andExpect(jsonPath("$.price").value(15.00))
                .andExpect(jsonPath("$.starters.length()").value(3))
                .andExpect(jsonPath("$.mainCourses.length()").value(3))
                .andExpect(jsonPath("$.desserts.length()").value(2))
                .andExpect(jsonPath("$.drink.name").value("Lassi"));
    }

    // US-05: if the day already has a menu, the system doesn't allow configuring another one.
    @Test
    @WithMockUser(username = "chef", roles = "CHEF")
    void secondMenuForTheSameDayIsRejected() throws Exception {
        createMenu(starters, mainCourses, desserts, drink);

        createMenu(starters, mainCourses, desserts, drink)
                .andExpect(status().isConflict());
    }

    // US-05: each part of the menu only accepts its dishes, so a dessert can't be a starter.
    @Test
    @WithMockUser(username = "chef", roles = "CHEF")
    void dishInTheWrongPartIsRejected() throws Exception {
        List<Long> wrongStarters = List.of(starters.get(0), starters.get(1), desserts.get(0));

        createMenu(wrongStarters, mainCourses, desserts, drink)
                .andExpect(status().isBadRequest());
    }

    // US-05: the options are different dishes, so the same dish can't be repeated.
    @Test
    @WithMockUser(username = "chef", roles = "CHEF")
    void repeatedDishIsRejected() throws Exception {
        List<Long> repeated = List.of(starters.get(0), starters.get(0), starters.get(1));

        createMenu(repeated, mainCourses, desserts, drink)
                .andExpect(status().isBadRequest());
    }

    // US-05: the menu has exactly three starters, three main courses and two desserts.
    @Test
    @WithMockUser(username = "chef", roles = "CHEF")
    void wrongNumberOfDishesIsRejected() throws Exception {
        createMenu(starters.subList(0, 2), mainCourses, desserts, drink)
                .andExpect(status().isBadRequest());
    }

    // US-05: the chef can also use withdrawn products and dishes only for menus (US-06).
    @Test
    @WithMockUser(username = "chef", roles = "CHEF")
    void withdrawnProductsAndMenuDishesCanBeUsed() throws Exception {
        Product withdrawn = productRepository.findById(starters.get(0)).orElseThrow();
        withdrawn.withdraw();
        productRepository.save(withdrawn);
        Long menuDish = productRepository.save(Product.menuDish("Thukpa", "Sopa", MenuUse.STARTER)).getId();

        createMenu(List.of(starters.get(0), starters.get(1), menuDish), mainCourses, desserts, drink)
                .andExpect(status().isCreated());
    }

    // US-10: each role only uses its own functions, so the owner can't configure the daily menu.
    @Test
    @WithMockUser(username = "dueno", roles = "OWNER")
    void ownerCannotConfigureDailyMenu() throws Exception {
        createMenu(starters, mainCourses, desserts, drink)
                .andExpect(status().isForbidden());
    }

    private Long save(String name, ProductCategory category) {
        return productRepository.save(new Product(name, "", new BigDecimal("5.00"), category)).getId();
    }

    // Sends the daily menu form. List.toString() writes [1, 2, 3], which is also valid JSON.
    private ResultActions createMenu(List<Long> starterIds, List<Long> mainCourseIds, List<Long> dessertIds,
            Long drinkId) throws Exception {
        String body = String.format(
                "{\"date\": \"%s\", \"starterIds\": %s, \"mainCourseIds\": %s, \"dessertIds\": %s, \"drinkId\": %d}",
                DAY, starterIds, mainCourseIds, dessertIds, drinkId);
        return mockMvc.perform(post("/api/daily-menus").contentType(MediaType.APPLICATION_JSON).content(body));
    }
}