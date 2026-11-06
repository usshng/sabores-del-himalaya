package com.foodordering.customer;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void register(@Valid @RequestBody RegisterCustomerRequest request) {
        customerService.register(request);
    }

    @PostMapping("/activation")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void activate(@RequestParam String token) {
        customerService.activate(token);
    }
}