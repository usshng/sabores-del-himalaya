package com.foodordering.product;

// How a dish can be used in the daily menu (US-06): as a starter, a main course or a dessert.
// Products of the menu don't need it, because their category already says how they can be used (US-05).
public enum MenuUse {
    STARTER,
    MAIN_COURSE,
    DESSERT
}