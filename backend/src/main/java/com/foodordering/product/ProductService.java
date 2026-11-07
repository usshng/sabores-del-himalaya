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

    /**
     * Adds a new product to the menu.
     *
     * @param request the data entered in the product form
     * @return the created product, already visible on the menu
     */
    @Transactional
    public ProductDto create(CreateProductRequest request) {
        Product product = new Product(request.name(), request.description(), request.price(), request.category());
        return ProductDto.from(productRepository.save(product));
    }

    /**
     * Returns the current data of a product, so the owner can see it before modifying it.
     *
     * @param id the product selected by the owner
     * @return the product's name, description, price and category
     * @throws ProductNotFoundException if the product does not exist
     */
    @Transactional(readOnly = true)
    public ProductDto getProduct(Long id) {
        return productRepository.findById(id)
                .map(ProductDto::from)
                .orElseThrow(ProductNotFoundException::new);
    }

    /**
     * Modifies a product; the changes are shown on the menu, while orders already placed keep their prices.
     *
     * @param id the product selected by the owner
     * @param request the new data entered in the product form
     * @return the product with its new data
     * @throws ProductNotFoundException if the product does not exist
     */
    @Transactional
    public ProductDto update(Long id, CreateProductRequest request) {
        Product product = productRepository.findById(id).orElseThrow(ProductNotFoundException::new);
        product.update(request.name(), request.description(), request.price(), request.category());
        return ProductDto.from(product);
    }

    /**
     * Withdraws a product from the menu; it stays stored so it can still be used in daily menus.
     *
     * @param id the product selected by the owner
     * @throws ProductNotFoundException if the product does not exist
     */
    @Transactional
    public void withdraw(Long id) {
        Product product = productRepository.findById(id).orElseThrow(ProductNotFoundException::new);
        product.withdraw();
    }
}