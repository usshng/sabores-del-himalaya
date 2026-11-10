package com.foodordering.auth;

import com.foodordering.customer.CustomerRepository;
import com.foodordering.staff.StaffAccountRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AppUserDetailsService implements UserDetailsService {

    private final CustomerRepository customerRepository;
    private final StaffAccountRepository staffAccountRepository;

    public AppUserDetailsService(CustomerRepository customerRepository,
            StaffAccountRepository staffAccountRepository) {
        this.customerRepository = customerRepository;
        this.staffAccountRepository = staffAccountRepository;
    }

    /**
     * Finds the user with the username.
     *
     * @param login the login typed in the login form
     * @return the user with its role. For the customers whose account is not activated yet, they are returned disabled
     * @throws UsernameNotFoundException if no user has that username
     */
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String login) {
        return customerRepository.findByLogin(login)
                .map(customer -> User.withUsername(customer.getLogin())
                        .password(customer.getPasswordHash())
                        .roles("CUSTOMER")
                        .disabled(!customer.isActive())
                        .build())
                .or(() -> staffAccountRepository.findByLogin(login)
                        .map(staff -> User.withUsername(staff.getLogin())
                                .password(staff.getPasswordHash())
                                .roles(staff.getRole().name())
                                .build()))
                .orElseThrow(() -> new UsernameNotFoundException(login));
    }
}