package com.foodordering.dailymenu;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

// A daily menu as the API returns it (US-05, US-07): the day, the fixed price and its dishes.
public record DailyMenuDto(Long id, LocalDate date, BigDecimal price, List<DailyMenuDishDto> starters,
        List<DailyMenuDishDto> mainCourses, List<DailyMenuDishDto> desserts, DailyMenuDishDto drink) {

    public static DailyMenuDto from(DailyMenu menu) {
        return new DailyMenuDto(menu.getId(), menu.getMenuDate(), DailyMenu.PRICE,
                menu.getStarters().stream().map(DailyMenuDishDto::from).toList(),
                menu.getMainCourses().stream().map(DailyMenuDishDto::from).toList(),
                menu.getDesserts().stream().map(DailyMenuDishDto::from).toList(),
                DailyMenuDishDto.from(menu.getDrink()));
    }
}