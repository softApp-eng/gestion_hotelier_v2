package com.softappeng.hotelv2.service;

import com.softappeng.hotelv2.entities.CategorieClient;
import com.softappeng.hotelv2.repositories.CategorieClientRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategorieClientService {

    private final CategorieClientRepo categorieClientRepo;

    public List<CategorieClient> findAll() {
        return categorieClientRepo.findAllByOrderByOrdreAsc();
    }

    public CategorieClient findById(Long id) {
        return categorieClientRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Catégorie client introuvable: " + id));
    }

    public CategorieClient save(CategorieClient c) {
        return categorieClientRepo.save(c);
    }

    public void delete(Long id) {
        categorieClientRepo.deleteById(id);
    }
}
