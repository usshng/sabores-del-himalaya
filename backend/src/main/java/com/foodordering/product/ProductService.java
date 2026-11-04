package com.foodordering.product;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * Returns the products currently on the menu, ordered by category and name.
     *
     * @return the available products; withdrawn products are not included
     */
    @Transactional(readOnly = true)
    public List<ProductDto> getMenu() {
        return productRepository.findByOnMenuTrueOrderByCategoryAscNameAsc().stream()
                .map(ProductDto::from)
                .toList();
    }
}