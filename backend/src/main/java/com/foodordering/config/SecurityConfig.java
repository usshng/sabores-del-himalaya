package com.foodordering.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;

@Configuration
public class SecurityConfig {

    // Public endpoints: health check, the menu, customer registration and activation, and login.
    // Everything else requires a logged-in session; without one the API answers 401.
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                // The REST API is called from the React app, which does not send CSRF tokens.
                .csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"))
                .authorizeHttpRequests(requests -> requests
                        // Spring forwards failed requests to /error; without this, every error is hidden behind a 401.
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/health", "/api/products").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/customers", "/api/customers/activation",
                                "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/products").hasRole("OWNER")
                        .requestMatchers("/api/products/**").hasRole("OWNER")
                        .requestMatchers("/api/orders/current/**").hasRole("CUSTOMER")
                        .requestMatchers("/api/staff/orders/**").hasRole("STAFF")
                        .requestMatchers(HttpMethod.GET, "/api/orders").hasRole("CUSTOMER")
                        .requestMatchers(HttpMethod.POST, "/api/orders/*/cancellation").hasRole("CUSTOMER")
                        .requestMatchers("/api/billing/**").hasRole("OWNER")
                        .anyRequest().authenticated())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler()))
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}