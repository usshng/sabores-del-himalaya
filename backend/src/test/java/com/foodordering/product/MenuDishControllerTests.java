package com.foodordering.product;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

// Tests of the dishes only for daily menus (US-06).
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MenuDishControllerTests {

    private static final String NEW_DISH =
            """
            {"name": "Thukpa", "description": "Sopa de fideos tibetana", "menuUse": "STARTER"}
            """;

    private static final String DISH_WITHOUT_USE =
            """
            {"name": "Thukpa", "description": "Sopa"}
            """;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductRepository productRepository;

    // Each test starts with an empty product table, so the results don't depend on other tests.
    @BeforeEach
    void clearProducts() {
        productRepository.deleteAll();
    }

    // US-06: the chef registers a dish with its name, description and use in the menu, and it is stored.
    @Test
    @WithMockUser(username = "chef", roles = "CHEF")
    void chefRegistersMenuDish() throws Exception {
        mockMvc.perform(post("/api/menu-dishes").contentType(MediaType.APPLICATION_JSON).content(NEW_DISH))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Thukpa"));

        Product dish = productRepository.findAll().getFirst();
        assertThat(dish.getMenuUse()).isEqualTo(MenuUse.STARTER);
        assertThat(dish.isOnMenu()).isFalse();
    }

    // US-06: these dishes don't appear on the menu, they are only used in daily menus.
    @Test
    @WithMockUser(username = "chef", roles = "CHEF")
    void menuDishIsNotShownOnTheMenu() throws Exception {
        mockMvc.perform(post("/api/menu-dishes").contentType(MediaType.APPLICATION_JSON).content(NEW_DISH));

        mockMvc.perform(get("/api/products"))
                .andExpect(jsonPath("$.length()").value(0));
    }

    // US-06: the name and the use in the menu are required.
    @Test
    @WithMockUser(username = "chef", roles = "CHEF")
    void menuDishWithoutUseIsRejected() throws Exception {
        mockMvc.perform(post("/api/menu-dishes").contentType(MediaType.APPLICATION_JSON)
                        .content(DISH_WITHOUT_USE))
                .andExpect(status().isBadRequest());
    }

    // US-10: each role only uses its own functions, so the owner can't register dishes for menus.
    @Test
    @WithMockUser(username = "dueno", roles = "OWNER")
    void ownerCannotRegisterMenuDishes() throws Exception {
        mockMvc.perform(post("/api/menu-dishes").contentType(MediaType.APPLICATION_JSON).content(NEW_DISH))
                .andExpect(status().isForbidden());
    }

    // Without a session, the API answers 401.
    @Test
    void registeringMenuDishesRequiresLogin() throws Exception {
        mockMvc.perform(post("/api/menu-dishes").contentType(MediaType.APPLICATION_JSON).content(NEW_DISH))
                .andExpect(status().isUnauthorized());
    }
}