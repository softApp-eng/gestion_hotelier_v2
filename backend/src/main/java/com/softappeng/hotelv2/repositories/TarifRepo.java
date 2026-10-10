package com.softappeng.hotelv2.repositories;

import com.softappeng.hotelv2.entities.Tarif;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TarifRepo extends JpaRepository<Tarif, Long> {
    Optional<Tarif> findByCategorieClientIdAndTypeChambreId(Long categorieClientId, Long typeChambreId);
    List<Tarif> findByCategorieClientId(Long categorieClientId);
    List<Tarif> findByTypeChambreId(Long typeChambreId);
}
