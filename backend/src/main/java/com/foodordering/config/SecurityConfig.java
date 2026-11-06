package com.foodordering.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    // Public endpoints: health check, the menu and customer registration. Everything else keeps Spring Boot's
    // default protection (form login and HTTP Basic) until the login user story is implemented.
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                // The REST API is called from the React app, which does not send CSRF tokens.
                .csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"))
                .authorizeHttpRequests(requests -> requests
                        // Spring forwards failed requests to /error; without this, every error is hidden behind a 401.
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/health", "/api/products").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/customers", "/api/customers/activation").permitAll()
                        .anyRequest().authenticated())
                .formLogin(Customizer.withDefaults())
                .httpBasic(Customizer.withDefaults())
                .build();
    }
}