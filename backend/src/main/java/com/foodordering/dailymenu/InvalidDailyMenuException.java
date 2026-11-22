package com.foodordering.dailymenu;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// We throw it when a chosen dish doesn't exist, is repeated or can't go in that part of the menu (US-05).
// The API answers 400.
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidDailyMenuException extends RuntimeException {

    public InvalidDailyMenuException() {
        super("Los platos elegidos no son válidos para el menú");
    }
}