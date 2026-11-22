package com.foodordering.dailymenu;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// We throw it when there is no menu for today (US-07). The API answers 404,
// so the frontend can show that the daily menu is not available.
@ResponseStatus(HttpStatus.NOT_FOUND)
public class DailyMenuNotFoundException extends RuntimeException {

    public DailyMenuNotFoundException() {
        super("No hay menú del día configurado para hoy");
    }
}