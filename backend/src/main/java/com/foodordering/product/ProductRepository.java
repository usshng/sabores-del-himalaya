package com.foodordering.product;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

// we use it to read and save products in the database
public interface ProductRepository extends JpaRepository<Product, Long> {

    // The menu for the customers (US-01)
    List<Product> findByOnMenuTrueOrderByCategoryAscNameAsc();
}


