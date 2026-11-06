package com.foodordering.customer;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class InvalidActivationTokenException extends RuntimeException {

    public InvalidActivationTokenException() {
        super("El enlace de activación no es válido o ya se ha usado");
    }
}