package com.softappeng.hotelv2.service;

import com.softappeng.hotelv2.entities.CategorieClient;
import com.softappeng.hotelv2.entities.Tarif;
import com.softappeng.hotelv2.entities.TypeChambre;
import com.softappeng.hotelv2.repositories.CategorieClientRepo;
import com.softappeng.hotelv2.repositories.TarifRepo;
import com.softappeng.hotelv2.repositories.TypeChambreRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TarifService {

    private final TarifRepo tarifRepo;
    private final CategorieClientRepo categorieClientRepo;
    private final TypeChambreRepo typeChambreRepo;

    public List<Tarif> findAll() {
        return tarifRepo.findAll();
    }

    /** Nightly price for a (category x room type); null when no tariff defined. */
    public Double findPrix(Long categorieClientId, Long typeChambreId) {
        if (categorieClientId == null || typeChambreId == null) return null;
        return tarifRepo.findByCategorieClientIdAndTypeChambreId(categorieClientId, typeChambreId)
                .map(Tarif::getPrix)
                .orElse(null);
    }

    /** Upsert: one tariff per (category x room type). */
    public Tarif save(Tarif t) {
        if (t.getCategorieClient() == null || t.getCategorieClient().getId() == null
                || t.getTypeChambre() == null || t.getTypeChambre().getId() == null) {
            throw new IllegalArgumentException("Catégorie client et type de chambre sont obligatoires");
        }
        CategorieClient cat = categorieClientRepo.findById(t.getCategorieClient().getId()).orElseThrow();
        TypeChambre type = typeChambreRepo.findById(t.getTypeChambre().getId()).orElseThrow();
        Tarif existing = tarifRepo
                .findByCategorieClientIdAndTypeChambreId(cat.getId(), type.getId())
                .orElseGet(Tarif::new);
        existing.setCategorieClient(cat);
        existing.setTypeChambre(type);
        existing.setPrix(t.getPrix());
        return tarifRepo.save(existing);
    }

    public void delete(Long id) {
        tarifRepo.deleteById(id);
    }
}
