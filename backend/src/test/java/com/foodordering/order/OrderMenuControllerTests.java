package com.foodordering.order;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
import java.time.LocalDate;
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

// Tests of adding the daily menu to the order (US-12).
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@WithMockUser(username = "ana", roles = "CUSTOMER")
class OrderMenuControllerTests {

    private static final String DAY = "2026-12-01";
    private static final ZoneId ZONE = ZoneId.of("Europe/Madrid");

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

    // A fake clock, so each test decides which day is "today".
    @MockitoBean
    private Clock clock;

    private List<Product> starters;
    private List<Product> mainCourses;
    private List<Product> desserts;

    // Each test starts with the customer Ana and the menu of the day DAY, which is "today".
    @BeforeEach
    void createCustomerAndDailyMenu() {
        clearData();
        Customer ana = new Customer("Ana", "Calle Mayor 1", "ana", "hash", "ana@ejemplo.com", "token");
        ana.activate();
        customerRepository.save(ana);
        starters = List.of(save("Momos", ProductCategory.STARTERS), save("Samosas", ProductCategory.STARTERS),
                save("Ensalada Himalaya", ProductCategory.SALADS));
        mainCourses = List.of(save("Dal bhat", ProductCategory.MAIN_COURSES),
                save("Curry de cordero", ProductCategory.MAIN_COURSES),
                save("Pollo tandoori", ProductCategory.TANDOORI));
        desserts = List.of(save("Kheer", ProductCategory.DESSERTS), save("Gulab jamun", ProductCategory.DESSERTS));
        Product lassi = save("Lassi", ProductCategory.DRINKS);
        dailyMenuRepository.save(new DailyMenu(LocalDate.parse(DAY), starters, mainCourses, desserts, lassi));
        setToday(DAY);
    }

    // The orders point to the menus and the menus to the products, so we delete them in this order.
    @AfterEach
    void clearData() {
        orderRepository.deleteAll();
        dailyMenuRepository.deleteAll();
        productRepository.deleteAll();
        customerRepository.deleteAll();
    }

    // US-12: the customer chooses one starter, one main course and one dessert, the drink is included
    // and the menu costs 15 €.
    @Test
    void customerAddsDailyMenuWithTheChosenDishes() throws Exception {
        addMenu(starters.get(0), mainCourses.get(1), desserts.get(0))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.menus.length()").value(1))
                .andExpect(jsonPath("$.menus[0].starter").value("Momos"))
                .andExpect(jsonPath("$.menus[0].mainCourse").value("Curry de cordero"))
                .andExpect(jsonPath("$.menus[0].dessert").value("Kheer"))
                .andExpect(jsonPath("$.menus[0].drink").value("Lassi"))
                .andExpect(jsonPath("$.menus[0].price").value(15.00))
                .andExpect(jsonPath("$.total").value(15.00));
    }

    // US-12: an order can have menus and products of the menu. Each menu is a line and adds 15 € to the total.
    @Test
    void menusAndProductsAreAddedToTheTotal() throws Exception {
        addMenu(starters.get(0), mainCourses.get(0), desserts.get(0));
        addMenu(starters.get(1), mainCourses.get(2), desserts.get(1));
        String body = "{\"productId\": " + starters.get(0).getId() + ", \"quantity\": 1}";
        mockMvc.perform(post("/api/orders/current/items").contentType(MediaType.APPLICATION_JSON).content(body));

        mockMvc.perform(get("/api/orders/current"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.menus.length()").value(2))
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.total").value(35.00));
    }

    // US-12: each dish has to be an option of its part of today's menu, so a dessert can't be the starter.
    @Test
    void dishThatIsNotAnOptionIsRejected() throws Exception {
        addMenu(desserts.get(0), mainCourses.get(0), desserts.get(1))
                .andExpect(status().isBadRequest());
    }

    // US-12: if there is no menu for today, the customer can't add it to the order.
    @Test
    void menuCanNotBeAddedIfThereIsNoMenuToday() throws Exception {
        setToday("2026-12-02");

        addMenu(starters.get(0), mainCourses.get(0), desserts.get(0))
                .andExpect(status().isNotFound());
    }

    // US-12: the staff sees the menu and its dishes in the detail of the order.
    @Test
    void staffSeesTheMenuInTheOrderDetail() throws Exception {
        addMenu(starters.get(2), mainCourses.get(0), desserts.get(0));
        mockMvc.perform(post("/api/orders/current/confirmation"));
        Long orderId = orderRepository.findAll().get(0).getId();

        mockMvc.perform(get("/api/staff/orders/" + orderId).with(user("personal").roles("STAFF")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.menus[0].starter").value("Ensalada Himalaya"))
                .andExpect(jsonPath("$.total").value(15.00));
    }

    // US-12: an order with only a menu can be confirmed, and the menu counts in the daily billing.
    @Test
    void confirmedMenuCountsInTheDailyBilling() throws Exception {
        addMenu(starters.get(0), mainCourses.get(0), desserts.get(0));

        mockMvc.perform(post("/api/orders/current/confirmation"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RECEIVED"))
                .andExpect(jsonPath("$.menus[0].mainCourse").value("Dal bhat"))
                .andExpect(jsonPath("$.total").value(15.00));

        mockMvc.perform(get("/api/billing/daily").param("date", DAY).with(user("dueno").roles("OWNER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderCount").value(1))
                .andExpect(jsonPath("$.total").value(15.00));
    }

    private Product save(String name, ProductCategory category) {
        return productRepository.save(new Product(name, "", new BigDecimal("5.00"), category));
    }

    private ResultActions addMenu(Product starter, Product mainCourse, Product dessert) throws Exception {
        String body = "{\"starterId\": " + starter.getId() + ", \"mainCourseId\": " + mainCourse.getId()
                + ", \"dessertId\": " + dessert.getId() + "}";
        return mockMvc.perform(post("/api/orders/current/menus").contentType(MediaType.APPLICATION_JSON)
                .content(body));
    }

    private void setToday(String day) {
        when(clock.getZone()).thenReturn(ZONE);
        when(clock.instant()).thenReturn(LocalDate.parse(day).atStartOfDay(ZONE).toInstant());
    }
}