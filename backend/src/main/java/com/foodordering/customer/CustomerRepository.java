package com.foodordering.customer;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

// To read and save customers in the database.
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    // Checking if a username is already registered
    boolean existsByLogin(String login);

    // Checking if a email is already registered
    boolean existsByEmail(String email);

    // To find the account of the activation token
    Optional<Customer> findByActivationToken(String activationToken);

    // Find account by their login, in order to know who is doing the order
    Optional<Customer> findByLogin(String login);

}