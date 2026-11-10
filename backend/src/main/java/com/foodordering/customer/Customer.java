package com.foodordering.customer;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

// A customer (a person that have an account in our system)
@Entity
public class Customer {

    // details of a customer, id, name, address to deliver, user(login),
    // the password encrypted using BCrypt hash, email, if the account is activated,
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false, unique = true)
    private String login;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private boolean active = false;

    // each activation link is unique and belongs only for a user
    @Column(unique = true)
    private String activationToken;

    protected Customer() {

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

    // some methods
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