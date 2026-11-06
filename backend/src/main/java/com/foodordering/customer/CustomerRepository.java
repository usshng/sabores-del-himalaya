package com.foodordering.customer;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    boolean existsByLogin(String login);

    boolean existsByEmail(String email);

    Optional<Customer> findByActivationToken(String activationToken);

    Optional<Customer> findByLogin(String login);

}