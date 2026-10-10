package com.softappeng.hotelv2.controller;

import com.softappeng.hotelv2.entities.CategorieMenu;
import com.softappeng.hotelv2.entities.Produit;
import com.softappeng.hotelv2.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    // ---- Categories ----
    @GetMapping("/categories")
    public List<CategorieMenu> categories() {
        return menuService.categories();
    }

    @PostMapping("/categories")
    public CategorieMenu createCategorie(@RequestBody CategorieMenu c) {
        return menuService.saveCategorie(c);
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategorie(@PathVariable Long id) {
        menuService.deleteCategorie(id);
        return ResponseEntity.noContent().build();
    }

    // ---- Products ----
    @GetMapping("/produits")
    public List<Produit> produits(@RequestParam(required = false) String q,
                                  @RequestParam(required = false) Long categorieId,
                                  @RequestParam(required = false) Boolean dispo) {
        if (Boolean.TRUE.equals(dispo)) {
            return menuService.produitsDisponibles();
        }
        return menuService.produits(q, categorieId);
    }

    @GetMapping("/produits/{id}")
    public Produit oneProduit(@PathVariable Long id) {
        return menuService.findProduit(id);
    }

    @PostMapping("/produits")
    public ResponseEntity<Produit> createProduit(@RequestBody Produit p) {
        return new ResponseEntity<>(menuService.saveProduit(p), HttpStatus.CREATED);
    }

    @PutMapping("/produits/{id}")
    public Produit updateProduit(@PathVariable Long id, @RequestBody Produit p) {
        p.setId(id);
        return menuService.saveProduit(p);
    }

    @DeleteMapping("/produits/{id}")
    public ResponseEntity<Void> deleteProduit(@PathVariable Long id) {
        menuService.deleteProduit(id);
        return ResponseEntity.noContent().build();
    }
}
