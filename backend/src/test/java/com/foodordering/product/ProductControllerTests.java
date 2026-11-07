package com.foodordering.product;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProductControllerTests {

    private static final String NEW_PRODUCT =
            """
            {"name": "Naan de ajo", "description": "Pan al horno con ajo", "price": 3.00, "category": "STARTERS"}
            """;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductRepository productRepository;

    @BeforeEach
    void clearProducts() {
        productRepository.deleteAll();
    }

    @Test
    void menuIsPublic() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk());
    }

    @Test
    void menuDoesNotIncludeWithdrawnProducts() throws Exception {
        productRepository.save(new Product("Momos", "Empanadillas al vapor", new BigDecimal("7.50"),
                ProductCategory.STARTERS));
        Product withdrawn = new Product("Plato retirado", "No debe salir", new BigDecimal("9.00"),
                ProductCategory.MAIN_COURSES);
        withdrawn.withdraw();
        productRepository.save(withdrawn);

        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Momos"));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void ownerAddsProductThatAppearsOnTheMenu() throws Exception {
        mockMvc.perform(post("/api/products").contentType(MediaType.APPLICATION_JSON).content(NEW_PRODUCT))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Naan de ajo"));

        mockMvc.perform(get("/api/products"))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].category").value("STARTERS"));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void customerCannotAddProducts() throws Exception {
        mockMvc.perform(post("/api/products").contentType(MediaType.APPLICATION_JSON).content(NEW_PRODUCT))
                .andExpect(status().isForbidden());
    }

    @Test
    void addingProductsRequiresLogin() throws Exception {
        mockMvc.perform(post("/api/products").contentType(MediaType.APPLICATION_JSON).content(NEW_PRODUCT))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void rejectsProductWithoutValidPrice() throws Exception {
        String invalidProduct = NEW_PRODUCT.replace("3.00", "-1");

        mockMvc.perform(post("/api/products").contentType(MediaType.APPLICATION_JSON).content(invalidProduct))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void ownerSeesCurrentDataOfProduct() throws Exception {
        Product momos = productRepository.save(new Product("Momos", "Empanadillas al vapor",
                new BigDecimal("7.50"), ProductCategory.STARTERS));

        mockMvc.perform(get("/api/products/" + momos.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Momos"))
                .andExpect(jsonPath("$.description").value("Empanadillas al vapor"))
                .andExpect(jsonPath("$.price").value(7.50))
                .andExpect(jsonPath("$.category").value("STARTERS"));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void ownerModifiesProductAndMenuShowsChanges() throws Exception {
        Product momos = productRepository.save(new Product("Momos", "Empanadillas al vapor",
                new BigDecimal("7.50"), ProductCategory.STARTERS));
        String changes =
                """
                {"name": "Momos de cerdo", "description": "Con salsa picante", "price": 8.00,
                 "category": "MAIN_COURSES"}
                """;

        mockMvc.perform(put("/api/products/" + momos.getId())
                        .contentType(MediaType.APPLICATION_JSON).content(changes))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/products"))
                .andExpect(jsonPath("$[0].name").value("Momos de cerdo"))
                .andExpect(jsonPath("$[0].price").value(8.00))
                .andExpect(jsonPath("$[0].category").value("MAIN_COURSES"));
    }

    @Test
    @WithMockUser(roles = "OWNER")
    void modifyingUnknownProductIsNotFound() throws Exception {
        mockMvc.perform(put("/api/products/999").contentType(MediaType.APPLICATION_JSON).content(NEW_PRODUCT))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void customerCannotModifyProducts() throws Exception {
        mockMvc.perform(put("/api/products/1").contentType(MediaType.APPLICATION_JSON).content(NEW_PRODUCT))
                .andExpect(status().isForbidden());
    }
}