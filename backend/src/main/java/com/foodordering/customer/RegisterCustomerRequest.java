package com.foodordering.customer;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterCustomerRequest(
        @NotBlank String name,
        @NotBlank String address,
        @NotBlank String login,
        @NotBlank String password,
        @NotBlank @Email String email) {
}