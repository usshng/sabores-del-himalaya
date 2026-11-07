package com.foodordering.order;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidStatusChangeException extends RuntimeException {

    public InvalidStatusChangeException() {
        super("El personal solo puede cambiar el estado a En preparación, En reparto o Entregado");
    }
}