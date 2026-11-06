package com.foodordering.order;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.foodordering.customer.Customer;
import com.foodordering.customer.CustomerRepository;
import com.foodordering.product.Product;
import com.foodordering.product.ProductCategory;
import com.foodordering.product.ProductRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@WithMockUser(roles = "STAFF")
class StaffOrderControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CustomerOrderRepository orderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    private Customer ana;
    private Product momos;

    @BeforeEach
    void createCustomerAndProduct() {
        clearData();
        ana = customerRepository.save(new Customer("Ana López", "Calle Mayor 1, Madrid", "ana", "hash",
                "ana@ejemplo.com", "token"));
        momos = productRepository.save(new Product("Momos", "Empanadillas al vapor", new BigDecimal("7.50"),
                ProductCategory.STARTERS));
    }

    // Orders reference customers and products, so they are removed first to keep other test classes clean.
    @AfterEach
    void clearData() {
        orderRepository.deleteAll();
        productRepository.deleteAll();
        customerRepository.deleteAll();
    }

    @Test
    void listsConfirmedOrdersFromOldestToNewestWithCustomerData() throws Exception {
        CustomerOrder later = placeOrder(LocalDateTime.of(2026, 11, 6, 14, 30));
        CustomerOrder earlier = placeOrder(LocalDateTime.of(2026, 11, 6, 13, 0));

        mockMvc.perform(get("/api/staff/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(earlier.getId()))
                .andExpect(jsonPath("$[1].id").value(later.getId()))
                .andExpect(jsonPath("$[0].customerName").value("Ana López"))
                .andExpect(jsonPath("$[0].customerAddress").value("Calle Mayor 1, Madrid"))
                .andExpect(jsonPath("$[0].status").value("RECEIVED"));
    }

    @Test
    void doesNotListOrdersStillInProgress() throws Exception {
        CustomerOrder inProgress = new CustomerOrder(ana);
        inProgress.addProduct(momos, 1);
        orderRepository.save(inProgress);

        mockMvc.perform(get("/api/staff/orders"))
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void detailShowsProductsQuantitiesAndTotal() throws Exception {
        CustomerOrder order = placeOrder(LocalDateTime.of(2026, 11, 6, 13, 0));

        mockMvc.perform(get("/api/staff/orders/" + order.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].name").value("Momos"))
                .andExpect(jsonPath("$.items[0].quantity").value(2))
                .andExpect(jsonPath("$.total").value(15.00));
    }

    @Test
    void unknownOrderIsNotFound() throws Exception {
        mockMvc.perform(get("/api/staff/orders/999")).andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void customersCannotSeeReceivedOrders() throws Exception {
        mockMvc.perform(get("/api/staff/orders")).andExpect(status().isForbidden());
    }

    private CustomerOrder placeOrder(LocalDateTime placedAt) {
        CustomerOrder order = new CustomerOrder(ana);
        order.addProduct(momos, 2);
        order.confirm(placedAt);
        return orderRepository.save(order);
    }
}