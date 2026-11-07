package com.foodordering.billing;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyBillingDto(LocalDate date, int orderCount, BigDecimal total) {
}