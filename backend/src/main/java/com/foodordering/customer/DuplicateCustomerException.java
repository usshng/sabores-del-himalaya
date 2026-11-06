package com.foodordering.customer;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicateCustomerException extends RuntimeException {

    public DuplicateCustomerException(String message) {
        super(message);
    }
}