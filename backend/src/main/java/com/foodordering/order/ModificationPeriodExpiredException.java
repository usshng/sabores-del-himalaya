package com.foodordering.order;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// We throw it when the customer tries to modify an order after the 10 minutes (US-15).
@ResponseStatus(HttpStatus.CONFLICT)
public class ModificationPeriodExpiredException extends RuntimeException {

    public ModificationPeriodExpiredException() {
        super("Solo se puede modificar un pedido en los 10 minutos siguientes a su realización");
    }
}