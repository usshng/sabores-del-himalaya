package com.foodordering.dailymenu;

import java.time.LocalDate;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

// We use it to read and save daily menus in the database.
public interface DailyMenuRepository extends JpaRepository<DailyMenu, Long> {

    // Checks if a day already has a menu, so we don't configure two for the same day (US-05).
    boolean existsByMenuDate(LocalDate menuDate);

    // Finds the menu of a day, used to show today's menu to the customers (US-07).
    Optional<DailyMenu> findByMenuDate(LocalDate menuDate);
}