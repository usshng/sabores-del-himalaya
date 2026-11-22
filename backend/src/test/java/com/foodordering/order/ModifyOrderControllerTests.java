package com.foodordering.order;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.foodordering.customer.Customer;
import com.foodordering.customer.CustomerRepository;
import com.foodordering.dailymenu.DailyMenu;
import com.foodordering.dailymenu.DailyMenuRepository;
import com.foodordering.product.Product;
import com.foodordering.product.ProductCategory;
import com.foodordering.product.ProductRepository;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneId;
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
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

// Tests of the modification of a placed order within 10 minutes (US-15).
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@WithMockUser(username = "ana", roles = "CUSTOMER")
class ModifyOrderControllerTests {

    private static final ZoneId ZONE = ZoneId.of("Europe/Madrid");
    private static final LocalDateTime PLACED_AT = LocalDateTime.of(2026, 12, 1, 13, 0);

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CustomerOrderRepository orderRepository;

    @Autowired
    private DailyMenuRepository dailyMenuRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CustomerRepository customerRepository;

    // A fake clock, so each test decides how many minutes have passed since the order was placed.
    @MockitoBean
    private Clock clock;

    private Customer ana;
    private Product momos;
    private Product naan;
    private DailyMenu dailyMenu;
    private List<Product> starters;
    private List<Product> mainCourses;
    private List<Product> desserts;

    // Each test starts with Ana, two products of the menu and the daily menu of the day of the order.
    @BeforeEach
    void createCustomerProductsAndDailyMenu() {
        clearData();
        ana = customerRepository.save(new Customer("Ana", "Calle Mayor 1", "ana", "hash", "ana@ejemplo.com", "t1"));
        momos = save("Momos", "7.50", ProductCategory.STARTERS);
        naan = save("Naan", "3.00", ProductCategory.STARTERS);
        starters = List.of(momos, save("Samosas", "5.00", ProductCategory.STARTERS),
                save("Ensalada Himalaya", "5.00", ProductCategory.SALADS));
        mainCourses = List.of(save("Dal bhat", "9.00", ProductCategory.MAIN_COURSES),
                save("Curry de cordero", "9.00", ProductCategory.MAIN_COURSES),
                save("Pollo tandoori", "9.00", ProductCategory.TANDOORI));
        desserts = List.of(save("Kheer", "4.00", ProductCategory.DESSERTS),
                save("Gulab jamun", "4.00", ProductCategory.DESSERTS));
        Product lassi = save("Lassi", "3.00", ProductCategory.DRINKS);
        dailyMenu = dailyMenuRepository.save(new DailyMenu(PLACED_AT.toLocalDate(), starters, mainCourses,
                desserts, lassi));
    }

    // The orders point to the menus and the menus to the products, so we delete them in this order.
    @AfterEach
    void clearData() {
        orderRepository.deleteAll();
        dailyMenuRepository.deleteAll();
        productRepository.deleteAll();
        customerRepository.deleteAll();
    }

    // US-15: within 10 minutes the customer changes quantities, removes a product and adds a new one,
    // and the total is updated.
    @Test
    void customerChangesQuantitiesAndProductsWithinTenMinutes() throws Exception {
        CustomerOrder order = placeOrder(false);
        setNow(PLACED_AT.plusMinutes(5));

        modify(order, "[{\"productId\": " + naan.getId() + ", \"quantity\": 3}]", "[]", "[]")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].name").value("Naan"))
                .andExpect(jsonPath("$.items[0].quantity").value(3))
                .andExpect(jsonPath("$.total").value(9.00));
    }

    // US-15: the customer can also keep a menu, remove products and add a new menu.
    @Test
    void customerAddsAndKeepsDailyMenus() throws Exception {
        CustomerOrder order = placeOrder(true);
        Long menuId = order.getMenus().get(0).getId();
        setNow(PLACED_AT.plusMinutes(5));
        String newMenu = "[{\"starterId\": " + starters.get(1).getId() + ", \"mainCourseId\": "
                + mainCourses.get(2).getId() + ", \"dessertId\": " + desserts.get(1).getId() + "}]";

        modify(order, "[]", "[" + menuId + "]", newMenu)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(0))
                .andExpect(jsonPath("$.menus.length()").value(2))
                .andExpect(jsonPath("$.total").value(30.00));
    }

    // US-15: after 10 minutes the system doesn't allow modifying the order.
    @Test
    void modificationAfterTenMinutesIsRejected() throws Exception {
        CustomerOrder order = placeOrder(false);
        setNow(PLACED_AT.plusMinutes(11));

        modify(order, "[{\"productId\": " + momos.getId() + ", \"quantity\": 1}]", "[]", "[]")
                .andExpect(status().isConflict());
    }

    // US-15: the 10 minutes count from the placement, so they don't start again after a modification.
    @Test
    void periodDoesNotStartAgainAfterModifying() throws Exception {
        CustomerOrder order = placeOrder(false);
        setNow(PLACED_AT.plusMinutes(5));
        modify(order, "[{\"productId\": " + momos.getId() + ", \"quantity\": 1}]", "[]", "[]")
                .andExpect(status().isOk());

        setNow(PLACED_AT.plusMinutes(11));
        modify(order, "[{\"productId\": " + momos.getId() + ", \"quantity\": 3}]", "[]", "[]")
                .andExpect(status().isConflict());
    }

    // US-15: the order can't be left empty (for that the customer cancels it, US-16), and it doesn't change.
    @Test
    void emptyOrderIsRejectedAndNothingChanges() throws Exception {
        CustomerOrder order = placeOrder(false);
        setNow(PLACED_AT.plusMinutes(5));

        modify(order, "[]", "[]", "[]").andExpect(status().isBadRequest());

        mockMvc.perform(get("/api/orders/" + order.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].quantity").value(2))
                .andExpect(jsonPath("$.total").value(15.00));
    }

    @Test
    void withdrawnProductCanNotBeAdded() throws Exception {
        naan.withdraw();
        productRepository.save(naan);
        CustomerOrder order = placeOrder(false);
        setNow(PLACED_AT.plusMinutes(5));

        modify(order, "[{\"productId\": " + naan.getId() + ", \"quantity\": 1}]", "[]", "[]")
                .andExpect(status().isNotFound());
    }

    private Product save(String name, String price, ProductCategory category) {
        return productRepository.save(new Product(name, "", new BigDecimal(price), category));
    }

    // An order placed at PLACED_AT with two momos (15 €) and, if needed, one daily menu (15 €).
    private CustomerOrder placeOrder(boolean withMenu) {
        CustomerOrder order = new CustomerOrder(ana);
        order.addProduct(momos, 2);
        if (withMenu) {
            order.addMenu(new OrderMenu(dailyMenu, starters.get(0), mainCourses.get(0), desserts.get(0)));
        }
        order.confirm(PLACED_AT);
        return orderRepository.save(order);
    }

    private ResultActions modify(CustomerOrder order, String items, String keptMenuIds, String newMenus)
            throws Exception {
        String body = "{\"items\": " + items + ", \"keptMenuIds\": " + keptMenuIds + ", \"newMenus\": "
                + newMenus + "}";
        return mockMvc.perform(put("/api/orders/" + order.getId()).contentType(MediaType.APPLICATION_JSON)
                .content(body));
    }

    private void setNow(LocalDateTime now) {
        when(clock.getZone()).thenReturn(ZONE);
        when(clock.instant()).thenReturn(now.atZone(ZONE).toInstant());
    }
}