package com.foodordering.customer;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false, unique = true)
    private String login;

    // Stores the BCrypt hash, never the plain password.
    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false, unique = true)
    private String email;

    // The account cannot log in until the customer follows the activation link (US-09).
    @Column(nullable = false)
    private boolean active = false;

    @Column(unique = true)
    private String activationToken;

    protected Customer() {
        // Required by JPA
    }

    public Customer(String name, String address, String login, String passwordHash, String email,
            String activationToken) {
        this.name = name;
        this.address = address;
        this.login = login;
        this.passwordHash = passwordHash;
        this.email = email;
        this.activationToken = activationToken;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getAddress() {
        return address;
    }

    public String getLogin() {
        return login;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getEmail() {
        return email;
    }

    public boolean isActive() {
        return active;
    }

    public String getActivationToken() {
        return activationToken;
    }

    public void activate() {
        this.active = true;
        this.activationToken = null;
    }
}