package com.foodordering.dailymenu;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

// The data that the chef sends from the daily menu form (P11) (US-05): the day and the ids of the chosen dishes.
// Spring checks how many dishes each part has before calling the service, so if not the API answers 400.
public record CreateDailyMenuRequest(
        @NotNull LocalDate date,
        @NotNull @Size(min = DailyMenu.STARTER_OPTIONS, max = DailyMenu.STARTER_OPTIONS) List<Long> starterIds,
        @NotNull @Size(min = DailyMenu.MAIN_COURSE_OPTIONS, max = DailyMenu.MAIN_COURSE_OPTIONS)
        List<Long> mainCourseIds,
        @NotNull @Size(min = DailyMenu.DESSERT_OPTIONS, max = DailyMenu.DESSERT_OPTIONS) List<Long> dessertIds,
        @NotNull Long drinkId) {
}