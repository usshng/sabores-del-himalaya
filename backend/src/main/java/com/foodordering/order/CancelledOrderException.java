package com.foodordering.order;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class CancelledOrderException extends RuntimeException {

    public CancelledOrderException() {
        super("Un pedido cancelado no puede cambiar de estado");
    }
}