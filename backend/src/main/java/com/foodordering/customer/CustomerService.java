package com.foodordering.customer;

import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final String frontendUrl;

    public CustomerService(CustomerRepository customerRepository, PasswordEncoder passwordEncoder,
            JavaMailSender mailSender, @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl) {
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
        this.frontendUrl = frontendUrl;
    }

    /**
     * Registers a new customer whose account stays pending until it is activated, and emails the activation link.
     *
     * @param request the data entered in the registration form
     * @throws DuplicateCustomerException if the login or the email is already registered
     */
    @Transactional
    public void register(RegisterCustomerRequest request) {
        if (customerRepository.existsByLogin(request.login())) {
            throw new DuplicateCustomerException("El login ya está registrado");
        }
        if (customerRepository.existsByEmail(request.email())) {
            throw new DuplicateCustomerException("El correo ya está registrado");
        }
        String token = UUID.randomUUID().toString();
        Customer customer = new Customer(request.name(), request.address(), request.login(),
                passwordEncoder.encode(request.password()), request.email(), token);
        customerRepository.save(customer);
        sendActivationEmail(customer.getEmail(), token);
    }

    /**
     * Activates the account linked to the activation token sent by email.
     *
     * @param token the token included in the activation link
     * @throws InvalidActivationTokenException if no pending account has that token
     */
    @Transactional
    public void activate(String token) {
        Customer customer = customerRepository.findByActivationToken(token)
                .orElseThrow(InvalidActivationTokenException::new);
        customer.activate();
    }

    private void sendActivationEmail(String email, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Activa tu cuenta en Sabor del Himalaya");
        message.setText("Para activar tu cuenta, abre este enlace: " + frontendUrl + "/activate?token=" + token);
        mailSender.send(message);
    }
}