package com.foodordering.product;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

// REST endpoints of the menu. The controller only translates HTTP into calls to the service,
// so the controller doesn't decide anything (no business rules)
@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    // GET /api/products, the menu for visitors and customers (US-01), answered as a JSON list.
    @GetMapping
    public List<ProductDto> getMenu() {
        return productService.getMenu();
    }

    // POST /api/products, when the owner adds a product (US-02).
    // @Valid checks the form details, if something is not right, API answers 400
    // If all is working, it answers 201 (created) with the new product
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductDto create(@Valid @RequestBody CreateProductRequest request) {
        return productService.create(request);
    }

    // GET /api/products/{id} so we can see the in the form the data of the product before we modify (US-03)
    @GetMapping("/{id}")
    public ProductDto getProduct(@PathVariable Long id) {
        return productService.getProduct(id);
    }

    // PUT /api/products/{id}, the owner modifies a product (US-03)
    @PutMapping("/{id}")
    public ProductDto update(@PathVariable Long id, @Valid @RequestBody CreateProductRequest request) {
        return productService.update(id, request);
    }

    // POST /api/products/{id}/withdrawal, when the owner withdraw a product
    // we don't use DELETE, because we only want to disabled on the menu.
    // API answers 204 (no content) if there is nothing.
    @PostMapping("/{id}/withdrawal")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void withdraw(@PathVariable Long id) {
        productService.withdraw(id);
    }
}