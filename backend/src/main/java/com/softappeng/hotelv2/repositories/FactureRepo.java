package com.softappeng.hotelv2.repositories;

import com.softappeng.hotelv2.entities.Facture;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface FactureRepo extends JpaRepository<Facture, Long> {

    List<Facture> findBySejourId(Long sejourId);

    List<Facture> findByDateEmissionBetween(LocalDateTime start, LocalDateTime end);

    List<Facture> findAllByOrderByDateEmissionDesc();

    long countByModePaiement(String modePaiement);
}
