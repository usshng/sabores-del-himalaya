package com.foodordering.customer;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CustomerControllerTests {

    private static final String VALID_REQUEST =
            """
            {"name": "Ana López", "address": "Calle Mayor 1, Madrid", "login": "ana",
             "password": "secreta123", "email": "ana@ejemplo.com"}
            """;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private JavaMailSender mailSender;

    @BeforeEach
    void clearCustomers() {
        customerRepository.deleteAll();
    }

    @Test
    void registersCustomerAsPendingAndSendsActivationEmail() throws Exception {
        mockMvc.perform(post("/api/customers").contentType(MediaType.APPLICATION_JSON).content(VALID_REQUEST))
                .andExpect(status().isCreated());

        Customer customer = customerRepository.findByLogin("ana").orElseThrow();
        assertThat(customer.isActive()).isFalse();
        assertThat(customer.getPasswordHash()).isNotEqualTo("secreta123");
        assertThat(passwordEncoder.matches("secreta123", customer.getPasswordHash())).isTrue();

        ArgumentCaptor<SimpleMailMessage> sentEmail = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(sentEmail.capture());
        assertThat(sentEmail.getValue().getTo()).containsExactly("ana@ejemplo.com");
        assertThat(sentEmail.getValue().getText()).contains(customer.getActivationToken());
    }

    @Test
    void rejectsDuplicateLogin() throws Exception {
        customerRepository.save(new Customer("Otra Ana", "Calle Sol 2", "ana", "hash", "otra@ejemplo.com", "token"));

        mockMvc.perform(post("/api/customers").contentType(MediaType.APPLICATION_JSON).content(VALID_REQUEST))
                .andExpect(status().isConflict());

        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }

    @Test
    void rejectsInvalidEmail() throws Exception {
        String invalidRequest = VALID_REQUEST.replace("ana@ejemplo.com", "no-es-un-correo");

        mockMvc.perform(post("/api/customers").contentType(MediaType.APPLICATION_JSON).content(invalidRequest))
                .andExpect(status().isBadRequest());
    }

    @Test
    void activatesAccountWithValidToken() throws Exception {
        customerRepository.save(new Customer("Ana", "Calle Mayor 1", "ana", "hash", "ana@ejemplo.com", "token-123"));

        mockMvc.perform(post("/api/customers/activation").param("token", "token-123"))
                .andExpect(status().isNoContent());

        Customer customer = customerRepository.findByLogin("ana").orElseThrow();
        assertThat(customer.isActive()).isTrue();
        assertThat(customer.getActivationToken()).isNull();
    }

    @Test
    void rejectsUnknownActivationToken() throws Exception {
        mockMvc.perform(post("/api/customers/activation").param("token", "no-existe"))
                .andExpect(status().isNotFound());
    }
}