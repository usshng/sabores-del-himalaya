package com.foodordering.order;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class EmptyOrderException extends RuntimeException {

    public EmptyOrderException() {
        super("No se puede confirmar un pedido vacío");
    }
}