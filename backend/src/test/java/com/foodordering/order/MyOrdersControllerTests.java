package com.foodordering.order;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.foodordering.customer.Customer;
import com.foodordering.customer.CustomerRepository;
import com.foodordering.product.Product;
import com.foodordering.product.ProductCategory;
import com.foodordering.product.ProductRepository;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneId;
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

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@WithMockUser(username = "ana", roles = "CUSTOMER")
class MyOrdersControllerTests {

    private static final ZoneId ZONE = ZoneId.of("Europe/Madrid");
    private static final LocalDateTime PLACED_AT = LocalDateTime.of(2026, 11, 6, 13, 0);

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CustomerOrderRepository orderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    @MockitoBean
    private Clock clock;

    private Customer ana;
    private Customer luis;
    private Product momos;

    @BeforeEach
    void createCustomersAndProduct() {
        clearData();
        ana = customerRepository.save(new Customer("Ana", "Calle Mayor 1", "ana", "hash", "ana@ejemplo.com", "t1"));
        luis = customerRepository.save(new Customer("Luis", "Calle Sol 2", "luis", "hash", "luis@ejemplo.com", "t2"));
        momos = productRepository.save(new Product("Momos", "Empanadillas al vapor", new BigDecimal("7.50"),
                ProductCategory.STARTERS));
    }

    @AfterEach
    void clearData() {
        orderRepository.deleteAll();
        productRepository.deleteAll();
        customerRepository.deleteAll();
    }

    @Test
    void showsOwnOrdersFromNewestToOldestWithDateTotalAndStatus() throws Exception {
        CustomerOrder older = placeOrder(ana, LocalDateTime.of(2026, 11, 5, 20, 0));
        CustomerOrder newer = placeOrder(ana, LocalDateTime.of(2026, 11, 6, 13, 0));
        newer.changeStatus(OrderStatus.IN_PREPARATION);
        orderRepository.save(newer);

        mockMvc.perform(get("/api/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(newer.getId()))
                .andExpect(jsonPath("$[0].status").value("IN_PREPARATION"))
                .andExpect(jsonPath("$[0].total").value(15.00))
                .andExpect(jsonPath("$[0].placedAt").isNotEmpty())
                .andExpect(jsonPath("$[1].id").value(older.getId()))
                .andExpect(jsonPath("$[1].status").value("RECEIVED"));
    }

    @Test
    void doesNotShowOtherCustomersOrders() throws Exception {
        placeOrder(luis, LocalDateTime.of(2026, 11, 6, 13, 0));

        mockMvc.perform(get("/api/orders")).andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void doesNotShowTheOrderStillInProgress() throws Exception {
        CustomerOrder inProgress = new CustomerOrder(ana);
        inProgress.addProduct(momos, 1);
        orderRepository.save(inProgress);

        mockMvc.perform(get("/api/orders")).andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void staffDoNotHaveOwnOrders() throws Exception {
        mockMvc.perform(get("/api/orders")).andExpect(status().isForbidden());
    }

    @Test
    void cancelsWithinTenMinutesAndOrderIsKeptAsCancelled() throws Exception {
        CustomerOrder order = placeOrder(ana, PLACED_AT);
        setNow(PLACED_AT.plusMinutes(9));

        mockMvc.perform(post("/api/orders/" + order.getId() + "/cancellation"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        mockMvc.perform(get("/api/orders"))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].status").value("CANCELLED"));
    }

    @Test
    void cannotCancelAfterTenMinutes() throws Exception {
        CustomerOrder order = placeOrder(ana, PLACED_AT);
        setNow(PLACED_AT.plusMinutes(11));

        mockMvc.perform(post("/api/orders/" + order.getId() + "/cancellation"))
                .andExpect(status().isConflict());
    }

    @Test
    void cannotCancelAnotherCustomersOrder() throws Exception {
        CustomerOrder order = placeOrder(luis, PLACED_AT);
        setNow(PLACED_AT.plusMinutes(1));

        mockMvc.perform(post("/api/orders/" + order.getId() + "/cancellation"))
                .andExpect(status().isNotFound());
    }

    @Test
    void cannotCancelTwice() throws Exception {
        CustomerOrder order = placeOrder(ana, PLACED_AT);
        setNow(PLACED_AT.plusMinutes(1));
        mockMvc.perform(post("/api/orders/" + order.getId() + "/cancellation"));

        mockMvc.perform(post("/api/orders/" + order.getId() + "/cancellation"))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser(roles = "STAFF")
    void staffCannotChangeStatusOfCancelledOrder() throws Exception {
        CustomerOrder order = placeOrder(ana, PLACED_AT);
        order.cancel(PLACED_AT.plusMinutes(1));
        orderRepository.save(order);

        mockMvc.perform(patch("/api/staff/orders/" + order.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\": \"IN_PREPARATION\"}"))
                .andExpect(status().isConflict());
    }

    private void setNow(LocalDateTime now) {
        when(clock.getZone()).thenReturn(ZONE);
        when(clock.instant()).thenReturn(now.atZone(ZONE).toInstant());
    }

    private CustomerOrder placeOrder(Customer customer, LocalDateTime placedAt) {
        CustomerOrder order = new CustomerOrder(customer);
        order.addProduct(momos, 2);
        order.confirm(placedAt);
        return orderRepository.save(order);
    }
}