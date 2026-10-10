package com.softappeng.hotelv2.repositories;

import com.softappeng.hotelv2.entities.Sejour;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SejourRepo extends JpaRepository<Sejour, Long> {
    List<Sejour> findByStatut(String statut);
    List<Sejour> findByChambreIdAndStatut(Long chambreId, String statut);
    long countByStatut(String statut);
}
