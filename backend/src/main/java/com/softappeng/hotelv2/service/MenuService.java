package com.softappeng.hotelv2.service;

import com.softappeng.hotelv2.entities.CategorieMenu;
import com.softappeng.hotelv2.entities.Produit;
import com.softappeng.hotelv2.repositories.CategorieMenuRepo;
import com.softappeng.hotelv2.repositories.ProduitRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final CategorieMenuRepo categorieRepo;
    private final ProduitRepo produitRepo;

    // ---- Categories ----
    public List<CategorieMenu> categories() {
        return categorieRepo.findAllByOrderByOrdreAsc();
    }

    public CategorieMenu saveCategorie(CategorieMenu c) {
        return categorieRepo.save(c);
    }

    public void deleteCategorie(Long id) {
        categorieRepo.deleteById(id);
    }

    // ---- Products ----
    public List<Produit> produits(String q, Long categorieId) {
        if ((q == null || q.isBlank()) && categorieId == null) {
            return produitRepo.findAll();
        }
        return produitRepo.search(q == null || q.isBlank() ? null : q.trim(), categorieId);
    }

    public List<Produit> produitsDisponibles() {
        return produitRepo.findByDisponibleTrue();
    }

    public Produit findProduit(Long id) {
        return produitRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("Produit introuvable: " + id));
    }

    public Produit saveProduit(Produit p) {
        if (p.getCategorie() != null && p.getCategorie().getId() != null) {
            p.setCategorie(categorieRepo.findById(p.getCategorie().getId()).orElse(null));
        }
        return produitRepo.save(p);
    }

    public void deleteProduit(Long id) {
        produitRepo.deleteById(id);
    }
}
