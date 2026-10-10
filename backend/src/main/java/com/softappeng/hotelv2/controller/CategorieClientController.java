package com.softappeng.hotelv2.controller;

import com.softappeng.hotelv2.entities.CategorieClient;
import com.softappeng.hotelv2.service.CategorieClientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories-clients")
@RequiredArgsConstructor
public class CategorieClientController {

    private final CategorieClientService categorieClientService;

    @GetMapping
    public List<CategorieClient> all() {
        return categorieClientService.findAll();
    }

    @GetMapping("/{id}")
    public CategorieClient one(@PathVariable Long id) {
        return categorieClientService.findById(id);
    }

    @PostMapping
    public ResponseEntity<CategorieClient> create(@RequestBody CategorieClient c) {
        return new ResponseEntity<>(categorieClientService.save(c), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public CategorieClient update(@PathVariable Long id, @RequestBody CategorieClient c) {
        c.setId(id);
        return categorieClientService.save(c);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categorieClientService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
