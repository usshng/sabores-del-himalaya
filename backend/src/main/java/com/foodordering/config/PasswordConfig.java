package com.foodordering.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

// Passwords needs to be encrypted, BCrypt transforms to hash,
// we use this for registration (US-08) and log in (US-10).
@Configuration
public class PasswordConfig {
    // @Bean is an object/instance that Spring creates and saves to give whenever you need it,
    // for example, if CustomerService needs a PasswordEncoder, Spring gives the same instance
    // created by passwordEncoder() in PasswordConfig, so you don't need to
    // write new BCryptPasswordEncoder everytime you need it.
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}