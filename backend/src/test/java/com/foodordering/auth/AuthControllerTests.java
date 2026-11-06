package com.foodordering.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.foodordering.customer.Customer;
import com.foodordering.customer.CustomerRepository;
import com.foodordering.staff.StaffAccount;
import com.foodordering.staff.StaffAccountRepository;
import com.foodordering.staff.StaffRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTests {

    private static final String PASSWORD = "secreta123";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private StaffAccountRepository staffAccountRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void clearAccounts() {
        customerRepository.deleteAll();
        staffAccountRepository.deleteAll();
    }

    @Test
    void activatedCustomerLogsInWithCustomerRole() throws Exception {
        saveCustomer("ana", true);

        login("ana", PASSWORD)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.login").value("ana"))
                .andExpect(jsonPath("$.role").value("CUSTOMER"));
    }

    @Test
    void staffLogsInWithTheirRole() throws Exception {
        staffAccountRepository.save(new StaffAccount("dueno", passwordEncoder.encode(PASSWORD), StaffRole.OWNER));

        login("dueno", PASSWORD)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("OWNER"));
    }

    @Test
    void rejectsWrongPassword() throws Exception {
        saveCustomer("ana", true);

        login("ana", "otra-clave").andExpect(status().isUnauthorized());
    }

    @Test
    void rejectsCustomerNotActivatedYet() throws Exception {
        saveCustomer("ana", false);

        login("ana", PASSWORD).andExpect(status().isForbidden());
    }

    @Test
    void sessionKeepsTheUserLoggedIn() throws Exception {
        saveCustomer("ana", true);
        MvcResult result = login("ana", PASSWORD).andReturn();
        MockHttpSession session = (MockHttpSession) result.getRequest().getSession();

        mockMvc.perform(get("/api/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.login").value("ana"));
    }

    @Test
    void currentUserRequiresLogin() throws Exception {
        mockMvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
    }

    private void saveCustomer(String login, boolean activated) {
        Customer customer = new Customer("Ana", "Calle Mayor 1", login, passwordEncoder.encode(PASSWORD),
                login + "@ejemplo.com", "token-" + login);
        if (activated) {
            customer.activate();
        }
        customerRepository.save(customer);
    }

    private org.springframework.test.web.servlet.ResultActions login(String login, String password) throws Exception {
        String body = "{\"login\": \"" + login + "\", \"password\": \"" + password + "\"}";
        return mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(body));
    }
}