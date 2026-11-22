package com.foodordering.dailymenu;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// We throw it when the chef configures a menu for a day that already has one (US-05). The API answers 409.
@ResponseStatus(HttpStatus.CONFLICT)
public class DailyMenuAlreadyExistsException extends RuntimeException {

    public DailyMenuAlreadyExistsException() {
        super("Ya hay un menú configurado para ese día");
    }
}