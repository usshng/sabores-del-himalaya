package com.foodordering.product;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// This is the business logic of the menu. So the controller only recieves
// the requests and calls these methods, so the rules of each user story is from here and not
// in the controller
@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * Returns the menu that visitors and clients see. Ordered by category and name (US-01)
     * The query is read only, so we don't change any data.
     *
     * @return the products on the menu, ready to be sent by the API.
     */
    @Transactional(readOnly = true)
    public List<ProductDto> getMenu() {
        return productRepository.findByOnMenuTrueOrderByCategoryAscNameAsc().stream()
                .map(ProductDto::from)
                .toList();
    }

    /**
     * Add new product to the menu for US-02.
     *
     * @param request the data introduced in the form
     * @return the new product, visible on the menu
     */
    @Transactional
    public ProductDto create(CreateProductRequest request) {
        Product product = new Product(request.name(), request.description(), request.price(), request.category());
        return ProductDto.from(productRepository.save(product));
    }

    /**
     * Returns the data of a product, so the owner can check it before the modification (US-03).
     *
     * @param id of the product selected
     * @return the product details: name, description, price and category
     * @throws ProductNotFoundException in the case the product does not exist.
     */
    @Transactional(readOnly = true)
    public ProductDto getProduct(Long id) {
        return productRepository.findById(id)
                .map(ProductDto::from)
                .orElseThrow(ProductNotFoundException::new);
    }

    /**
     * Modifying a product (US-03). The changes introduced are shown on the menu,
     * those orders done before these changes keeps their original prices before modification.
     *
     * @param id the product selected
     * @param request the new data
     * @return the product with the data changed
     * @throws ProductNotFoundException if the product does not exist
     */
    @Transactional
    public ProductDto update(Long id, CreateProductRequest request) {
        Product product = productRepository.findById(id).orElseThrow(ProductNotFoundException::new);
        product.update(request.name(), request.description(), request.price(), request.category());
        return ProductDto.from(product);
    }

    /**
     * Withdraw of a product of the menu.
     *
     * @param id the product selected
     * @throws ProductNotFoundException if the product does not exist
     */
    @Transactional
    public void withdraw(Long id) {
        Product product = productRepository.findById(id).orElseThrow(ProductNotFoundException::new);
        product.withdraw();
    }
}