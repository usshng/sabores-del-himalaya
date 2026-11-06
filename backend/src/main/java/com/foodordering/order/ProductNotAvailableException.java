package com.foodordering.order;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ProductNotAvailableException extends RuntimeException {

    public ProductNotAvailableException() {
        super("El producto no está disponible en la carta");
    }
}