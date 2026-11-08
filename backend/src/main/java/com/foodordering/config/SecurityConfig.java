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

// Access rules of the REST API. The idea here is to define the public endpoints,
// the endpoints that need a logged-in user,
// and the endpoints that need a role in the session
// (such as OWNER, CUSTOMER, STAFF).

// Rules are checked in order (from top to bottom),
// and the first rule that matches wins. So the order of the rules is important!

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                // By defect, every action that changes data such as POST, PUT, PATCH, DELETE
                // needs to be sent with a CSRF token
                // in order to prevent CSRF attacks. As we don't want to configure it for React yet,
                // we disabled CSRF protection of Spring for whatever API call.
                .csrf(csrf -> csrf.ignoringRequestMatchers("/api/**"))
                .authorizeHttpRequests(requests -> requests
                        // Every failed request will be shown as 401 to the client by default,
                        // we make it public so the user can see which error code it is (404, 409, etc).
                        .requestMatchers("/error").permitAll()
                        // We define public endpoints, so anyone can access them and see, such as menu (US-01)
                        .requestMatchers(HttpMethod.GET, "/api/health", "/api/products").permitAll()
                        // registrarion (US-08), activation link (US-09), login (US-10).
                        .requestMatchers(HttpMethod.POST, "/api/customers", "/api/customers/activation",
                                "/api/auth/login").permitAll()
                        // Here we define which endpoints can be accessed only with a session and role.
                        // (We check the role by hasRole)
                        // For the OWNER only: add products (US-02), view and modify products (US-03),
                        // withdraw products (US-04).
                        .requestMatchers(HttpMethod.POST, "/api/products").hasRole("OWNER")
                        .requestMatchers("/api/products/**").hasRole("OWNER")
                        // For the CUSTOMER only: the current order, add products to the cart,
                        // review the order and confirm it. (US-11, US-13, US-14)
                        .requestMatchers("/api/orders/current/**").hasRole("CUSTOMER")
                        // For the STAFF only: recieve orders and change status of the orders (US-18, US-19).
                        .requestMatchers("/api/staff/orders/**").hasRole("STAFF")
                        // For the CUSTOMER only: look the orders confirmed (US-17)
                        // and cancellation of the order in the range of 10 minutes (US-16)
                        .requestMatchers(HttpMethod.GET, "/api/orders").hasRole("CUSTOMER")
                        .requestMatchers(HttpMethod.POST, "/api/orders/*/cancellation").hasRole("CUSTOMER")
                        // For the OWNER only: the billing (US-20)
                        .requestMatchers("/api/billing/**").hasRole("OWNER")
                        // Any endpoint not covered before can only be accessed by a logged-in user.
                        .anyRequest().authenticated())
                // If you try to access an endpoint without a session, the API returns 401.
                // By default, with a session but the wrong role, Spring returns 403.
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                // Logout ends the session and returns 200
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler()))
                .build();
    }

    // This checks the login user and password (by AppUserDetailsService and BCrypt)
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}