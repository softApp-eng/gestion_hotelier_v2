package com.softappeng.hotelv2.repositories;

import com.softappeng.hotelv2.entities.Produit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProduitRepo extends JpaRepository<Produit, Long> {
    List<Produit> findByDisponibleTrue();
    List<Produit> findByCategorieId(Long categorieId);

    @Query("""
            SELECT p FROM Produit p
            WHERE (:q IS NULL OR LOWER(p.nom) LIKE LOWER(CONCAT('%', :q, '%')))
              AND (:categorieId IS NULL OR p.categorie.id = :categorieId)
            """)
    List<Produit> search(@Param("q") String q, @Param("categorieId") Long categorieId);
}
