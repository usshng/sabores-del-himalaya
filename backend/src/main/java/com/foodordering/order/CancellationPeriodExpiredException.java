package com.foodordering.order;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class CancellationPeriodExpiredException extends RuntimeException {

    public CancellationPeriodExpiredException() {
        super("Solo se puede cancelar un pedido en los 10 minutos siguientes a su realización");
    }
}