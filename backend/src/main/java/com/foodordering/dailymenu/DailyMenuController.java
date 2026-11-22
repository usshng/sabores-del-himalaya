package com.foodordering.dailymenu;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

// REST endpoints of the daily menus. It only receives the requests and calls the service.
@RestController
@RequestMapping("/api/daily-menus")
public class DailyMenuController {

    private final DailyMenuService dailyMenuService;

    public DailyMenuController(DailyMenuService dailyMenuService) {
        this.dailyMenuService = dailyMenuService;
    }

    // POST /api/daily-menus, when the chef configures the menu of a day (US-05).
    // If it works, the API answers 201 (created) with the new menu.
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DailyMenuDto create(@Valid @RequestBody CreateDailyMenuRequest request) {
        return dailyMenuService.create(request);
    }

    // GET /api/daily-menus/today, today's menu for visitors and customers (US-07).
    // If there is no menu for today, the API answers 404.
    @GetMapping("/today")
    public DailyMenuDto getTodayMenu() {
        return dailyMenuService.getTodayMenu();
    }
}