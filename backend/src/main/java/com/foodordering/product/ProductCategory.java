package com.foodordering.product;

// Six categories of the menu that we defined in the Product Backlog (US-01)
// For the frontend we will show the categories in this order in Spanish:
// Entrantes, Ensaladas, Tandoori, Platos principales, Postres, Bebidas
// The owner can't create new categories because of US-02.
// It is stored as text in the database. So each product's category
// is saved as a word and not by numbers.
public enum ProductCategory {
    STARTERS,
    SALADS,
    TANDOORI,
    MAIN_COURSES,
    DESSERTS,
    DRINKS
}


