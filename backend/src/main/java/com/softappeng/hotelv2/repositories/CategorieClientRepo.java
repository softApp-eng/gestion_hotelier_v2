package com.softappeng.hotelv2.repositories;

import com.softappeng.hotelv2.entities.CategorieClient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategorieClientRepo extends JpaRepository<CategorieClient, Long> {
    Optional<CategorieClient> findByCode(String code);
    List<CategorieClient> findAllByOrderByOrdreAsc();
}
