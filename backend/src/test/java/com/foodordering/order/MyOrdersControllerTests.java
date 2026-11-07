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
@WithMockUser(username = "ana", roles = "CUSTOMER")
class MyOrdersControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CustomerOrderRepository orderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

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

    // Orders reference customers and products, so they are removed first to keep other test classes clean.
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

    private CustomerOrder placeOrder(Customer customer, LocalDateTime placedAt) {
        CustomerOrder order = new CustomerOrder(customer);
        order.addProduct(momos, 2);
        order.confirm(placedAt);
        return orderRepository.save(order);
    }
}