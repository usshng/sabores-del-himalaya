package com.foodordering.billing;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.foodordering.customer.Customer;
import com.foodordering.customer.CustomerRepository;
import com.foodordering.order.CustomerOrder;
import com.foodordering.order.CustomerOrderRepository;
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
@WithMockUser(roles = "OWNER")
class BillingControllerTests {

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
        ana = customerRepository.save(new Customer("Ana", "Calle Mayor 1", "ana", "hash", "ana@ejemplo.com", "t1"));
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
    void addsUpOrdersOfTheDayWithoutCancelledOnes() throws Exception {
        placeOrder(2, LocalDateTime.of(2026, 11, 6, 13, 0));
        placeOrder(1, LocalDateTime.of(2026, 11, 6, 21, 30));
        CustomerOrder cancelled = placeOrder(4, LocalDateTime.of(2026, 11, 6, 14, 0));
        cancelled.cancel(LocalDateTime.of(2026, 11, 6, 14, 5));
        orderRepository.save(cancelled);
        placeOrder(3, LocalDateTime.of(2026, 11, 7, 0, 0));

        mockMvc.perform(get("/api/billing/daily").param("date", "2026-11-06"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.date").value("2026-11-06"))
                .andExpect(jsonPath("$.orderCount").value(2))
                .andExpect(jsonPath("$.total").value(22.50));
    }

    @Test
    void dayWithoutOrdersHasZeroTotal() throws Exception {
        mockMvc.perform(get("/api/billing/daily").param("date", "2026-11-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderCount").value(0))
                .andExpect(jsonPath("$.total").value(0));
    }

    @Test
    void ordersStillInProgressAreNotBilled() throws Exception {
        CustomerOrder inProgress = new CustomerOrder(ana);
        inProgress.addProduct(momos, 5);
        orderRepository.save(inProgress);

        mockMvc.perform(get("/api/billing/daily").param("date", "2026-11-06"))
                .andExpect(jsonPath("$.orderCount").value(0));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void customersCannotSeeBilling() throws Exception {
        mockMvc.perform(get("/api/billing/daily").param("date", "2026-11-06"))
                .andExpect(status().isForbidden());
    }

    private CustomerOrder placeOrder(int quantity, LocalDateTime placedAt) {
        CustomerOrder order = new CustomerOrder(ana);
        order.addProduct(momos, quantity);
        order.confirm(placedAt);
        return orderRepository.save(order);
    }
}