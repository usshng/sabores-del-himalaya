package com.foodordering.order;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// We throw it when a chosen dish is not an option of today's menu, for example a starter as dessert (US-12).
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidMenuChoiceException extends RuntimeException {

    public InvalidMenuChoiceException() {
        super("El plato elegido no es una opción del menú del día");
    }
}