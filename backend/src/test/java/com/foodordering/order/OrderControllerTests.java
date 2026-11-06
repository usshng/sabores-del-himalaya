package com.foodordering.order;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.foodordering.customer.Customer;
import com.foodordering.customer.CustomerRepository;
import com.foodordering.product.Product;
import com.foodordering.product.ProductCategory;
import com.foodordering.product.ProductRepository;
import java.math.BigDecimal;
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

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@WithMockUser(username = "ana", roles = "CUSTOMER")
class OrderControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CustomerOrderRepository orderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    private Product momos;

    @BeforeEach
    void createCustomerAndProduct() {
        clearData();
        Customer ana = new Customer("Ana", "Calle Mayor 1", "ana", "hash", "ana@ejemplo.com", "token");
        ana.activate();
        customerRepository.save(ana);
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
    void addsProductWithItsNamePriceAndQuantity() throws Exception {
        addProduct(momos.getId(), 2)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].name").value("Momos"))
                .andExpect(jsonPath("$.items[0].unitPrice").value(7.50))
                .andExpect(jsonPath("$.items[0].quantity").value(2));
    }

    @Test
    void addingTheSameProductAgainIncreasesItsQuantity() throws Exception {
        addProduct(momos.getId(), 2);

        addProduct(momos.getId(), 1)
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].quantity").value(3));
    }

    @Test
    void orderInProgressStaysSaved() throws Exception {
        addProduct(momos.getId(), 2);

        mockMvc.perform(get("/api/orders/current"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].name").value("Momos"));
    }

    @Test
    void rejectsWithdrawnProduct() throws Exception {
        momos.withdraw();
        productRepository.save(momos);

        addProduct(momos.getId(), 1).andExpect(status().isNotFound());
    }

    @Test
    void rejectsQuantityBelowOne() throws Exception {
        addProduct(momos.getId(), 0).andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void staffCannotComposeOrders() throws Exception {
        addProduct(momos.getId(), 1).andExpect(status().isForbidden());
    }

    private ResultActions addProduct(Long productId, int quantity) throws Exception {
        String body = "{\"productId\": " + productId + ", \"quantity\": " + quantity + "}";
        return mockMvc.perform(post("/api/orders/current/items").contentType(MediaType.APPLICATION_JSON).content(body));
    }
}